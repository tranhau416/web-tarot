import pytest

from app.services import quantum_engine
from app.services.quantum_engine import _select_unique_indices, fetch_quantum_bytes


def test_selection_is_unique_and_uses_entropy_in_order():
    # m=78 → limit=234: byte 250 bị loại, 5 % 78 = 5 được nhận
    indices, used = _select_unique_indices(78, 3, [250, 5, 0, 0])
    assert used == [5, 0, 0]
    assert indices[0] == 5
    assert len(set(indices)) == 3


def test_selection_tops_up_when_entropy_runs_out(monkeypatch):
    monkeypatch.setattr(quantum_engine.secrets, "randbelow", lambda n: 7)
    indices, used = _select_unique_indices(10, 3, [1])
    assert used == [1, 7, 7]
    assert len(set(indices)) == 3


def test_selection_never_repeats_cards():
    import secrets

    for _ in range(500):
        indices, _ = _select_unique_indices(78, 10, list(secrets.token_bytes(36)))
        assert len(set(indices)) == 10
        assert all(0 <= i < 78 for i in indices)


async def test_fetch_prefers_anu(monkeypatch):
    async def anu(n, client):
        return list(range(n))

    monkeypatch.setattr(quantum_engine, "_fetch_from_anu", anu)
    data, source = await fetch_quantum_bytes(4)
    assert (data, source) == ([0, 1, 2, 3], "anu_qrng")


async def test_fetch_falls_back_and_skips_failed_source(monkeypatch):
    calls = {"anu": 0}

    async def anu(n, client):
        calls["anu"] += 1
        return [1]  # quá ngắn → bị coi là lỗi

    async def random_org(n, client):
        return [9] * n

    monkeypatch.setattr(quantum_engine, "_fetch_from_anu", anu)
    monkeypatch.setattr(quantum_engine, "_fetch_from_random_org", random_org)

    assert await fetch_quantum_bytes(3) == ([9, 9, 9], "random_org")
    assert await fetch_quantum_bytes(3) == ([9, 9, 9], "random_org")
    assert calls["anu"] == 1  # lần 2 bỏ qua ANU trong thời gian cooldown


async def test_fetch_rejects_out_of_range_values(monkeypatch):
    async def anu(n, client):
        return [300] * n

    monkeypatch.setattr(quantum_engine, "_fetch_from_anu", anu)
    data, source = await fetch_quantum_bytes(5)
    assert source == "os_entropy"
    assert len(data) == 5


@pytest.mark.parametrize(("spread", "size"), [
    ("single", 1), ("three_card", 3), ("horseshoe", 7), ("celtic_cross", 10),
])
def test_spread_sizes(spread, size):
    assert quantum_engine.get_spread_size(spread) == size

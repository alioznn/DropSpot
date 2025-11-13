from __future__ import annotations

import hashlib
import os
from dataclasses import dataclass


SEED_VALUE = os.getenv("DROPSPOT_SEED", "5d75cfcdfd3f")


@dataclass(frozen=True)
class PriorityCoefficients:
    a: int
    b: int
    c: int


def compute_coefficients(seed: str = SEED_VALUE) -> PriorityCoefficients:
    if len(seed) < 6:
        raise ValueError("Seed must be at least 6 characters")
    a = 7 + (int(seed[0:2], 16) % 5)
    b = 13 + (int(seed[2:4], 16) % 7)
    c = 3 + (int(seed[4:6], 16) % 3)
    return PriorityCoefficients(a=a, b=b, c=c)


def hash_context_value(*parts: str) -> int:
    raw = "|".join(parts)
    digest = hashlib.sha256(raw.encode()).hexdigest()
    return int(digest[:8], 16)


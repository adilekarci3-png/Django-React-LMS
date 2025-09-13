# utils/booleans.py (örnek dosya)
try:
    # Python < 3.12
    from distutils.util import strtobool  # type: ignore[attr-defined]
except Exception:
    # Python 3.12+
    def strtobool(val: str) -> int:
        val = val.lower()
        if val in ("y", "yes", "t", "true", "on", "1"):
            return 1
        if val in ("n", "no", "f", "false", "off", "0"):
            return 0
        raise ValueError(f"invalid truth value {val!r}")

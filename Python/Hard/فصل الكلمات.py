
# Creator: OmarAfet
# https://profile.satr.codes/OmarAfet/public/overview
# https://github.com/OmarAfet

def cap_space(txt: str) -> str:
    result = ""
    for i, c in enumerate(txt):
        if c.isupper() and i > 0:
            result += " "
        result += c.lower()
    return result
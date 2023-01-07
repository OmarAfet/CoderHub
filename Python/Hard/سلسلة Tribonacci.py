
# Creator: M7ilan
# https://profile.satr.codes/m7ilan/public/overview
# Discord: M7ilan#5185
# https://github.com/M7ilan

def tribonacci(num):
    if num == 0:
        return []
    elif num == 1:
        return [1]
    elif num == 2:
        return [1, 1]
    elif num == 3:
        return [1, 1, 1]
    else:
        t = tribonacci(num - 1)
        next_num = t[-1] + t[-2] + t[-3]
        t.append(next_num)
        return t
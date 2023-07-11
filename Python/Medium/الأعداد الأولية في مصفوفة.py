
# Creator: OmarAfet
# https://profile.satr.codes/OmarAfet/public/overview
# https://github.com/OmarAfet

def primes_nums(numbers: list[int]) -> list[int]:
    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(n ** 0.5) + 1):
            if n % i == 0:
                return False
        return True
    return [n for n in numbers if is_prime(n)]
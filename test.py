class Stack:
    def __init__(self):
        self.stack = []
        self.seen = set()

    def push(self, char):
        if char not in self.seen:
            self.stack.append(char)
            self.seen.add(char)

    def pop_all_reversed(self):
        return ''.join(reversed(self.stack))


def unique_letters_reversed(s):
    stack = Stack()

    for ch in s:
        stack.push(ch)

    return stack.pop_all_reversed()


s = "aaabbbbcccdddeeee"
result = unique_letters_reversed(s)
print(result)  

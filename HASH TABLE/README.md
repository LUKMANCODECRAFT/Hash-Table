# HashTable Engine & Interactive Visualizer Studio

A high-performance, feature-rich Hash Table implementation in Python, complete with separate chaining collision resolution, dynamic capacity management, Pythonic dictionary protocols, diagnostic statistics, and a sleek web-based interactive visualizer.

---

## ✨ Features

- **Pythonic Dictionary Protocol**: Acts just like a native Python `dict` with dunder methods (`ht["key"] = val`, `val = ht["key"]`, `del ht["key"]`, `"key" in ht`, `len(ht)`, `for key in ht`).
- **Multiple Hashing Strategies**:
  - `unicode_sum`: Sum of character ASCII values (default Unicode sum algorithm).
  - `polynomial`: Polynomial rolling hash ($p=31, m=10^9+9$).
  - `fnv1a`: Fowler–Noll–Vo 32-bit fast non-cryptographic hash.
  - `builtin`: Python integer hash modulo algorithm.
- **Separate Chaining Collision Resolution**: Handles hash collisions gracefully using nested dictionary buckets, ensuring no loss of data even when keys produce identical hash values.
- **Dynamic Load Factor & Auto-Resizing**: Calculates load factor ($\alpha = N / \text{capacity}$) and automatically expands bucket capacity when reaching the load factor threshold (default: `0.75`).
- **Performance & Diagnostic Analytics**: `.stats()` returns total entries, active bucket count, max collision chain depth, average lookup complexity, and collision rate percentage.
- **Interactive Web Visualizer**: Dark-mode glassmorphism dashboard allowing real-time insertion, lookup, removal, step-by-step character-by-character ASCII calculation trace, and visual bucket array inspector.
- **100% Backward Compatibility**: Keeps the original `add()`, `lookup()`, `remove()`, `hash()`, and `collection` interface intact.

---

## 📁 File Structure

```text
HASH TABLE/
├── hash-table.py      # Core upgraded HashTable Python implementation
├── hash_table.py      # Alias module allowing `import hash_table`
├── test_hash_table.py # Automated unittest suite (7 test suites)
├── index.html         # Interactive Web Dashboard structure
├── styles.css         # Refined, professional slate CSS theme
├── app.js             # JavaScript controller for web visualizer
└── README.md          # Project documentation
```

---

## 🚀 Quick Start

### 1. Python Engine Usage

```python
from hash_table import HashTable

# Initialize Hash Table with initial capacity and hashing algorithm
ht = HashTable(initial_capacity=8, hash_algorithm="unicode_sum")

# Standard Pythonic dictionary syntax
ht["golf"] = "sport"
ht["flog"] = "activity"  # Anagram collision handled via separate chaining!

print(ht["golf"])  # Output: 'sport'
print("golf" in ht) # Output: True
print(len(ht))     # Output: 2

# Inspect collision statistics
print(ht.stats())
# Output:
# {
#   'total_items': 2,
#   'active_buckets': 1,
#   'capacity': 8,
#   'load_factor': 0.25,
#   'total_collisions': 1,
#   'max_chain_length': 2,
#   'avg_chain_length': 2.0,
#   'collision_rate_pct': 50.0,
#   'hash_algorithm': 'unicode_sum'
# }
```

### 2. Running Automated Unit Tests

Run the comprehensive unit test suite via Python `unittest`:

```bash
python -m unittest test_hash_table.py -v
```

All 7 test suites verify:
- Basic CRUD operations (`add`, `lookup`, `remove`, `get`, `clear`).
- Anagram collision handling and separate chaining bucket isolation.
- Dunder dictionary protocols (`__getitem__`, `__setitem__`, `__delitem__`, `__contains__`, `__len__`, `__iter__`).
- Alternative hashing algorithms (`unicode_sum`, `polynomial`, `fnv1a`, `builtin`).
- Dynamic capacity growth and load factor thresholds.
- Statistics calculations.

### 3. Launching the Web Visualizer

To run the interactive web visualizer in your local browser:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/index.html` in your web browser.

---

## 🛠️ API Reference

### `HashTable(initial_capacity=None, hash_algorithm='unicode_sum', max_load_factor=0.75)`
- `hash(key: str) -> int`: Computes the integer hash value for a key string.
- `add(key: str, value) -> None`: Inserts or updates a key-value pair.
- `lookup(key: str) -> object`: Retrieves the value for `key`, or `None` if missing.
- `remove(key: str) -> None`: Removes `key` and its associated value.
- `get(key: str, default=None) -> object`: Retrieves `key` or returns `default`.
- `resize(new_capacity: int) -> None`: Rehashes all elements into a new bucket size.
- `clear() -> None`: Clears all entries.
- `stats() -> dict`: Returns diagnostic statistics.
- `keys() -> list`, `values() -> list`, `items() -> list`: Helper iterators.

---

## 📄 License
MIT License. Open source and free to modify.

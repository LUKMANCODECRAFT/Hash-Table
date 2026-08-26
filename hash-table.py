class HashTable:
    """
    Implements a production-grade, feature-rich Hash Table supporting multiple hashing algorithms,
    separate chaining collision resolution, dynamic load factor management, pythonic dictionary syntax,
    and detailed collision performance analytics.
    """

    SUPPORTED_ALGORITHMS = ("unicode_sum", "polynomial", "fnv1a", "builtin")

    def __init__(self, initial_capacity: int = None, hash_algorithm: str = "unicode_sum", max_load_factor: float = 0.75):
        """
        Initializes the HashTable.

        :param initial_capacity: Optional bucket count for modulo-based bucket hashing.
                                If None, unbounded raw hash values are used as keys in `collection`.
        :param hash_algorithm: Hashing strategy ('unicode_sum', 'polynomial', 'fnv1a', 'builtin').
        :param max_load_factor: Threshold ratio triggering automatic capacity expansion.
        """
        if hash_algorithm not in self.SUPPORTED_ALGORITHMS:
            raise ValueError(f"Unsupported hash algorithm '{hash_algorithm}'. Choose from: {self.SUPPORTED_ALGORITHMS}")

        self.collection = {}
        self.capacity = initial_capacity
        self.hash_algorithm = hash_algorithm
        self.max_load_factor = max_load_factor

    def hash(self, key: str) -> int:
        """
        Computes the hash value of a string key based on the selected algorithm.
        """
        key_str = str(key)

        if self.hash_algorithm == "unicode_sum":
            raw_hash = sum(ord(char) for char in key_str)
        elif self.hash_algorithm == "polynomial":
            p, m = 31, 10**9 + 9
            raw_hash = 0
            p_pow = 1
            for char in key_str:
                raw_hash = (raw_hash + (ord(char) - ord('a') + 1) * p_pow) % m
                p_pow = (p_pow * p) % m
        elif self.hash_algorithm == "fnv1a":
            fnv_prime = 0x01000193
            raw_hash = 0x811c9dc5
            for char in key_str:
                raw_hash ^= ord(char)
                raw_hash = (raw_hash * fnv_prime) & 0xFFFFFFFF
        elif self.hash_algorithm == "builtin":
            raw_hash = abs(hash(key_str))
        else:
            raw_hash = sum(ord(char) for char in key_str)

        if self.capacity and self.capacity > 0:
            return raw_hash % self.capacity
        return raw_hash

    def add(self, key: str, value) -> None:
        """
        Adds a key-value pair to the hash table.
        Handles collisions by storing the pair in a nested dictionary under the computed hash value.
        Auto-resizes if capacity is set and load factor exceeds threshold.
        """
        key_str = str(key)
        hash_value = self.hash(key_str)

        if hash_value not in self.collection:
            self.collection[hash_value] = {}

        self.collection[hash_value][key_str] = value

        # Check for auto-resize if capacity is bounded
        if self.capacity and self.load_factor > self.max_load_factor:
            self.resize(self.capacity * 2)

    def remove(self, key: str) -> None:
        """
        Removes a specific key-value pair from the hash table.
        Does nothing if the key is not found.
        """
        key_str = str(key)
        hash_value = self.hash(key_str)

        if hash_value in self.collection:
            nested_dict = self.collection[hash_value]
            if key_str in nested_dict:
                del nested_dict[key_str]
                if not nested_dict:
                    del self.collection[hash_value]

    def lookup(self, key: str):
        """
        Retrieves the value associated with a given key.
        Returns None if the key is not found.
        """
        key_str = str(key)
        hash_value = self.hash(key_str)

        if hash_value in self.collection:
            nested_dict = self.collection[hash_value]
            if key_str in nested_dict:
                return nested_dict[key_str]
        return None

    def get(self, key: str, default=None):
        """
        Retrieves the value for key if key is in the table, else default.
        """
        val = self.lookup(key)
        return val if val is not None else default

    def resize(self, new_capacity: int) -> None:
        """
        Resizes the bucket capacity and rehashes all existing key-value pairs.
        """
        old_items = self.items()
        self.capacity = max(1, new_capacity)
        self.collection = {}
        for k, v in old_items:
            self.add(k, v)

    def clear(self) -> None:
        """
        Removes all items from the hash table.
        """
        self.collection.clear()

    @property
    def load_factor(self) -> float:
        """
        Calculates current load factor (total items / bucket capacity).
        If capacity is unbounded (None), returns size / max(1, bucket_count).
        """
        total_items = len(self)
        if self.capacity and self.capacity > 0:
            return total_items / self.capacity
        active_buckets = len(self.collection)
        return total_items / active_buckets if active_buckets > 0 else 0.0

    def stats(self) -> dict:
        """
        Returns diagnostic statistics on hash table performance and collision distribution.
        """
        total_items = len(self)
        active_buckets = len(self.collection)
        chain_lengths = [len(chain) for chain in self.collection.values()]
        max_chain = max(chain_lengths) if chain_lengths else 0
        collisions = sum(max(0, length - 1) for length in chain_lengths)
        avg_chain = (sum(chain_lengths) / active_buckets) if active_buckets > 0 else 0.0

        return {
            "total_items": total_items,
            "active_buckets": active_buckets,
            "capacity": self.capacity,
            "load_factor": round(self.load_factor, 4),
            "total_collisions": collisions,
            "max_chain_length": max_chain,
            "avg_chain_length": round(avg_chain, 2),
            "collision_rate_pct": round((collisions / total_items * 100), 2) if total_items > 0 else 0.0,
            "hash_algorithm": self.hash_algorithm
        }

    # Helper methods & Iterators
    def keys(self) -> list:
        return [k for chain in self.collection.values() for k in chain.keys()]

    def values(self) -> list:
        return [v for chain in self.collection.values() for v in chain.values()]

    def items(self) -> list:
        return [(k, v) for chain in self.collection.values() for k, v in chain.items()]

    # Pythonic Dunder Methods (dictionary protocol)
    def __getitem__(self, key: str):
        val = self.lookup(key)
        if val is None and key not in self:
            raise KeyError(f"Key '{key}' not found in HashTable.")
        return val

    def __setitem__(self, key: str, value) -> None:
        self.add(key, value)

    def __delitem__(self, key: str) -> None:
        if key not in self:
            raise KeyError(f"Key '{key}' not found in HashTable.")
        self.remove(key)

    def __contains__(self, key: str) -> bool:
        hash_value = self.hash(str(key))
        return hash_value in self.collection and str(key) in self.collection[hash_value]

    def __len__(self) -> int:
        return sum(len(chain) for chain in self.collection.values())

    def __iter__(self):
        return iter(self.keys())

    def __repr__(self) -> str:
        items_str = ", ".join(f"{repr(k)}: {repr(v)}" for k, v in self.items())
        return f"HashTable({{{items_str}}}, capacity={self.capacity}, algo='{self.hash_algorithm}')"

    def __str__(self) -> str:
        return self.__repr__()


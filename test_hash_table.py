import unittest
import importlib

# Import HashTable dynamically from hash-table.py
spec = importlib.util.spec_from_file_location("hash_table_module", "hash-table.py")
ht_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ht_module)
HashTable = ht_module.HashTable


class TestHashTable(unittest.TestCase):

    def setUp(self):
        self.ht = HashTable()

    def test_basic_crud(self):
        self.ht.add("python", "awesome")
        self.ht.add("javascript", "web")
        self.assertEqual(self.ht.lookup("python"), "awesome")
        self.assertEqual(self.ht.lookup("javascript"), "web")
        self.assertIsNone(self.ht.lookup("nonexistent"))

        # Test remove
        self.ht.remove("python")
        self.assertIsNone(self.ht.lookup("python"))

    def test_collision_handling(self):
        # 'golf' and 'flog' are anagrams and have identical unicode_sum hash (424)
        hash_golf = self.ht.hash("golf")
        hash_flog = self.ht.hash("flog")
        self.assertEqual(hash_golf, hash_flog)

        self.ht.add("golf", "sport")
        self.ht.add("flog", "activity")

        # Verify both items exist in the nested dictionary under the same hash index
        self.assertIn(hash_golf, self.ht.collection)
        self.assertEqual(len(self.ht.collection[hash_golf]), 2)

        # Lookups work independently
        self.assertEqual(self.ht.lookup("golf"), "sport")
        self.assertEqual(self.ht.lookup("flog"), "activity")

        # Removing one does not affect the other
        self.ht.remove("golf")
        self.assertIsNone(self.ht.lookup("golf"))
        self.assertEqual(self.ht.lookup("flog"), "activity")
        self.assertIn(hash_flog, self.ht.collection)

        # Removing the second cleans up the collection key
        self.ht.remove("flog")
        self.assertNotIn(hash_flog, self.ht.collection)

    def test_dunder_dict_interface(self):
        self.ht["apple"] = "fruit"
        self.ht["carrot"] = "vegetable"

        self.assertEqual(self.ht["apple"], "fruit")
        self.assertEqual(len(self.ht), 2)
        self.assertIn("apple", self.ht)
        self.assertNotIn("banana", self.ht)

        # Iteration
        keys = list(self.ht)
        self.assertIn("apple", keys)
        self.assertIn("carrot", keys)

        # Deletion
        del self.ht["apple"]
        self.assertNotIn("apple", self.ht)
        self.assertEqual(len(self.ht), 1)

        with self.assertRaises(KeyError):
            _ = self.ht["missing_key"]

        with self.assertRaises(KeyError):
            del self.ht["missing_key"]

    def test_alternative_hash_algorithms(self):
        algorithms = ["unicode_sum", "polynomial", "fnv1a", "builtin"]
        for algo in algorithms:
            ht = HashTable(initial_capacity=16, hash_algorithm=algo)
            ht.add("test_key", 100)
            self.assertEqual(ht.lookup("test_key"), 100)
            self.assertEqual(ht.stats()["hash_algorithm"], algo)

    def test_bounded_capacity_and_resizing(self):
        ht = HashTable(initial_capacity=4, max_load_factor=0.75)
        self.assertEqual(ht.capacity, 4)

        # Add items to trigger resize when load_factor > 0.75 (> 3 items)
        ht.add("k1", "v1")
        ht.add("k2", "v2")
        ht.add("k3", "v3")
        self.assertEqual(ht.capacity, 4)

        ht.add("k4", "v4")  # 4/4 = 1.0 > 0.75 -> trigger resize to 8
        self.assertGreaterEqual(ht.capacity, 8)
        self.assertEqual(ht.lookup("k1"), "v1")
        self.assertEqual(ht.lookup("k4"), "v4")

    def test_stats_and_metrics(self):
        self.ht.add("golf", "sport")
        self.ht.add("flog", "activity")
        stats = self.ht.stats()

        self.assertEqual(stats["total_items"], 2)
        self.assertEqual(stats["active_buckets"], 1)
        self.assertEqual(stats["total_collisions"], 1)
        self.assertEqual(stats["max_chain_length"], 2)
        self.assertEqual(stats["collision_rate_pct"], 50.0)

    def test_clear_and_get(self):
        self.ht.add("a", 1)
        self.ht.add("b", 2)
        self.assertEqual(self.ht.get("a"), 1)
        self.assertEqual(self.ht.get("c", "default_val"), "default_val")

        self.ht.clear()
        self.assertEqual(len(self.ht), 0)
        self.assertEqual(len(self.ht.collection), 0)


if __name__ == "__main__":
    unittest.main()

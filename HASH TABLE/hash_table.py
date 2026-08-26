"""
Alias module for hash-table.py allowing standard Python `import hash_table`.
"""
import sys
import pathlib
import importlib.util

spec_file = pathlib.Path(__file__).parent / "hash-table.py"
spec = importlib.util.spec_from_file_location("hash_table_hyphen", spec_file)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

HashTable = mod.HashTable

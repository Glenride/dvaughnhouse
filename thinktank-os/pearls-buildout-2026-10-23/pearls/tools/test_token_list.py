#!/usr/bin/env python3
"""
tools/test_token_list.py

Automated test/fixture verifying tools/generate_token_list.py parses Launched events,
validates schema rules per Uniswap Token List v1.0.0, and ensures exact field parity.
"""

import json
import os
import unittest
from generate_token_list import generate_token_list, format_token_entry


class TestUniswapTokenListGenerator(unittest.TestCase):
    def setUp(self):
        self.fixtures_path = os.path.join(os.path.dirname(__file__), "fixtures", "launch_events.json")
        with open(self.fixtures_path, "r", encoding="utf-8") as f:
            self.events = json.load(f)

    def test_generate_token_list_schema(self):
        """Verifies top-level Uniswap Token List schema compliance."""
        token_list = generate_token_list(self.events, default_chain_id=84532, timestamp="2026-10-24T00:00:00Z")

        # Top-level required keys
        self.assertIn("name", token_list)
        self.assertIn("timestamp", token_list)
        self.assertIn("version", token_list)
        self.assertIn("tokens", token_list)

        # Version format
        self.assertEqual(token_list["version"]["major"], 1)
        self.assertEqual(token_list["version"]["minor"], 0)
        self.assertEqual(token_list["version"]["patch"], 0)

        # List length
        self.assertEqual(len(token_list["tokens"]), len(self.events))

    def test_token_fields_and_extensions(self):
        """Verifies that each token entry includes valid addresses, poolId, tickSpacing, and extensions."""
        token_list = generate_token_list(self.events, default_chain_id=84532, timestamp="2026-10-24T00:00:00Z")

        for idx, token in enumerate(token_list["tokens"]):
            event = self.events[idx]
            self.assertEqual(token["chainId"], event["chainId"])
            self.assertEqual(token["address"], event["token"])
            self.assertEqual(token["name"], event["name"])
            self.assertEqual(token["symbol"], event["symbol"])
            self.assertEqual(token["decimals"], event["decimals"])

            # Check extensions
            ext = token["extensions"]
            self.assertEqual(ext["certificateId"], event["certificateId"])
            self.assertEqual(ext["poolId"], event["poolId"])
            self.assertEqual(ext["poolFeeTier"], event["poolFeeTier"])
            self.assertEqual(ext["tickSpacing"], event["tickSpacing"])
            self.assertEqual(ext["hook"], event["hook"])
            self.assertEqual(ext["quoteAsset"], event["quoteAsset"])

            # Verify hook ends with 0x00cc (TC_HOOK_FLAGS)
            self.assertTrue(ext["hook"].lower().endswith("00cc"))

    def test_single_token_entry_formatting(self):
        """Tests format_token_entry on individual event."""
        e = self.events[0]
        entry = format_token_entry(e, default_chain_id=84532)
        self.assertEqual(entry["address"], e["token"])
        self.assertEqual(entry["extensions"]["poolFeeTier"], 3000)
        self.assertEqual(entry["extensions"]["tickSpacing"], 60)


if __name__ == "__main__":
    unittest.main()

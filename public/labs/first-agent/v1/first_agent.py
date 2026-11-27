"""Week 1 starter lab. Run python3 first_agent.py --check."""

import argparse
import json

INVENTORY = {"mug": 12, "notebook": 5, "pen": 0}
NOT_FOUND = "No matching item."

# These recorded messages stand in for model responses so an eval can run offline.
RESPONSES = {
    "How many mugs are in stock?": {"tool": "lookup_stock", "item": "mug"},
    "How many notebooks are in stock?": {"tool": "lookup_stock", "item": " Notebook "},
    "How many pens are in stock?": {"tool": "lookup_stock", "item": "pen"},
    "How many lamps are in stock?": {"tool": "lookup_stock", "item": "lamp"},
    "Hello": {"answer": "Hello!"},
}


def lookup_stock(item):
    # TODO: Normalize the tool's argument before looking it up.
    return INVENTORY.get(item, NOT_FOUND)


def run_turn(prompt):
    response = RESPONSES[prompt]
    if "answer" in response:
        return {"tool_calls": [], "result": response["answer"]}
    if response["tool"] != "lookup_stock":
        raise ValueError("Unexpected tool in replay")

    item = response["item"]
    return {"tool_calls": ["lookup_stock"], "result": lookup_stock(item)}


def check():
    cases = [
        ("exact item", "How many mugs are in stock?", ["lookup_stock"], 12),
        ("formatted item", "How many notebooks are in stock?", ["lookup_stock"], 5),
        ("zero stock", "How many pens are in stock?", ["lookup_stock"], 0),
        ("unknown item", "How many lamps are in stock?", ["lookup_stock"], NOT_FOUND),
        ("no tool needed", "Hello", [], "Hello!"),
    ]
    passed = 0
    for name, prompt, calls, result in cases:
        expected = {"tool_calls": calls, "result": result}
        actual = run_turn(prompt)
        if actual == expected:
            passed += 1
            print(f"PASS {name}")
        else:
            print(f"FAIL {name}: expected {expected!r}, got {actual!r}")
    print(f"{passed}/{len(cases)} passed")
    return passed == len(cases)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    choices = parser.add_mutually_exclusive_group(required=True)
    choices.add_argument("--check", action="store_true", help="Run the regression cases")
    choices.add_argument("--prompt", choices=RESPONSES, help="Replay a recorded turn")
    args = parser.parse_args()

    if args.check:
        return 0 if check() else 1
    print(json.dumps(run_turn(args.prompt), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
import os
import re

def fix_imports(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match relative imports without .js extension
    pattern = r"from '(\.\.?[^']*)';$"
    def replace_func(match):
        path = match.group(1)
        if not path.endswith('.js') and not path.startswith('./node_modules'):
            return f"from '{path}.js';"
        return match.group(0)

    new_content = re.sub(pattern, replace_func, content, flags=re.MULTILINE)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed: {filepath}')

# Find all .ts files in api directory
for root, dirs, files in os.walk('api'):
    for file in files:
        if file.endswith('.ts'):
            filepath = os.path.join(root, file)
            fix_imports(filepath)

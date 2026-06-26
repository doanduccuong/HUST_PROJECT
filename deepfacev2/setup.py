import json
import setuptools

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as f:
    requirements = f.read().split("\n")
# Filter empty lines
requirements = [r.strip() for r in requirements if r.strip()]

with open("package_info.json", "r", encoding="utf-8") as f:
    package_info = json.load(f)

setuptools.setup(
    name="deepfacev2",
    version=package_info["version"],
    author="Antigravity Team",
    author_email="antigravity@google.com",
    description="Adaptive Face & Mask Detection 5-Stage Pipeline Framework",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
)

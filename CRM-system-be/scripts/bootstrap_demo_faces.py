#!/usr/bin/env python3
"""Enroll the two face-demo customers through the real Java -> AI pipeline."""

from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

import requests


CUSTOMERS = [
    {
        "name": "Keanu Reeves (Demo)",
        "url": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Keanu_Reeves-2019.jpg",
        "filename": "keanu-reeves-demo.jpg",
    },
    {
        "name": "Emma Watson (Demo)",
        "url": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Emma_Watson_2013.jpg",
        "filename": "emma-watson-demo.jpg",
    },
]


def download(url: str, destination: Path) -> None:
    response = requests.get(
        url,
        headers={"User-Agent": "CRM-face-demo/1.0 (educational demo)"},
        timeout=60,
    )
    response.raise_for_status()
    destination.write_bytes(response.content)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", default="http://localhost:8081")
    parser.add_argument("--username", default="manager")
    parser.add_argument("--password", default="demo123")
    args = parser.parse_args()

    session = requests.Session()
    login = session.post(
        f"{args.api_url}/api/v1/auth/login",
        json={"username": args.username, "password": args.password},
        timeout=20,
    )
    login.raise_for_status()
    session.headers["Authorization"] = f"Bearer {login.json()['token']}"

    with tempfile.TemporaryDirectory(prefix="crm-face-demo-") as temp_dir:
        temp_path = Path(temp_dir)
        for customer in CUSTOMERS:
            image_path = temp_path / customer["filename"]
            download(customer["url"], image_path)

            with image_path.open("rb") as image_file:
                enrolled = session.post(
                    f"{args.api_url}/api/v1/customers/register",
                    data={"name": customer["name"]},
                    files={"file": (customer["filename"], image_file, "image/jpeg")},
                    timeout=120,
                )
            enrolled.raise_for_status()
            enrollment = enrolled.json()

            with image_path.open("rb") as image_file:
                identified = session.post(
                    f"{args.api_url}/api/v1/customers/identify",
                    data={"source": "ENROLLMENT"},
                    files={"file": (customer["filename"], image_file, "image/jpeg")},
                    timeout=120,
                )
            identified.raise_for_status()
            result = identified.json()
            print(
                f"{enrollment['name']}: customerId={enrollment['customerId']}, "
                f"searchStatus={result['status']}, quality={result['quality']['score']}"
            )


if __name__ == "__main__":
    main()

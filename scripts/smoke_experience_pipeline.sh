#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
API_URL=${API_URL:-http://localhost:8081}
USERNAME=${SMOKE_USERNAME:-manager}
PASSWORD=${SMOKE_PASSWORD:-demo123}
IMAGE_PATH=${SMOKE_IMAGE_PATH:-$ROOT_DIR/CRM-system-be/test_images/S001_after.jpg}

for command_name in curl jq; do
  command -v "$command_name" >/dev/null || {
    echo "Missing required command: $command_name" >&2
    exit 1
  }
done

[[ -f "$IMAGE_PATH" ]] || {
  echo "Smoke image not found: $IMAGE_PATH" >&2
  exit 1
}

LOGIN_JSON=$(curl -fsS -X POST "$API_URL/api/v1/auth/login" \
  -H 'Content-Type: application/json' \
  --data "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")
TOKEN=$(jq -er '.token' <<<"$LOGIN_JSON")

UNAUTHORIZED_STATUS=$(curl -sS -o /dev/null -w '%{http_code}' -X POST \
  "$API_URL/api/v1/experience/sessions" \
  -H 'Content-Type: application/json' \
  --data '{"cameraId":"CAM-UNAUTHORIZED","zone":"PRODUCT","sourceType":"VIDEO_FILE"}')
[[ "$UNAUTHORIZED_STATUS" == "403" ]] || {
  echo "Expected unauthorized start to return 403, got $UNAUTHORIZED_STATUS" >&2
  exit 1
}

CAMERA_ID="CAM-SMOKE-$(date +%s)"
START_JSON=$(curl -fsS -X POST "$API_URL/api/v1/experience/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  --data "{\"cameraId\":\"$CAMERA_ID\",\"zone\":\"PRODUCT\",\"sourceType\":\"VIDEO_FILE\"}")
SESSION_ID=$(jq -er '.sessionId' <<<"$START_JSON")
[[ $(jq -r '.status' <<<"$START_JSON") == "OPEN" ]]

for sequence in 1 2 3; do
  FRAME_JSON=$(curl -fsS --max-time 300 -X POST \
    "$API_URL/api/v1/experience/sessions/$SESSION_ID/frames?sequence=$sequence" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@$IMAGE_PATH;type=image/jpeg")
  [[ $(jq -r '.sequence' <<<"$FRAME_JSON") == "$sequence" ]]
  [[ $(jq -r '.accepted' <<<"$FRAME_JSON") == "true" ]]
done

DUPLICATE_STATUS=$(curl -sS -o /dev/null -w '%{http_code}' -X POST \
  "$API_URL/api/v1/experience/sessions/$SESSION_ID/frames?sequence=3" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$IMAGE_PATH;type=image/jpeg")
[[ "$DUPLICATE_STATUS" == "409" ]] || {
  echo "Expected duplicate sequence to return 409, got $DUPLICATE_STATUS" >&2
  exit 1
}

CLOSE_JSON=$(curl -fsS -X POST \
  "$API_URL/api/v1/experience/sessions/$SESSION_ID/close" \
  -H "Authorization: Bearer $TOKEN")
jq -e '.status == "CLOSED" and .totalFrames == 3 and .acceptedFrames == 3' \
  >/dev/null <<<"$CLOSE_JSON"

SECOND_CLOSE_JSON=$(curl -fsS -X POST \
  "$API_URL/api/v1/experience/sessions/$SESSION_ID/close" \
  -H "Authorization: Bearer $TOKEN")
jq -e --arg id "$SESSION_ID" '.sessionId == $id and .status == "CLOSED" and .totalFrames == 3' \
  >/dev/null <<<"$SECOND_CLOSE_JSON"

CLOSED_FRAME_STATUS=$(curl -sS -o /dev/null -w '%{http_code}' -X POST \
  "$API_URL/api/v1/experience/sessions/$SESSION_ID/frames?sequence=4" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$IMAGE_PATH;type=image/jpeg")
[[ "$CLOSED_FRAME_STATUS" == "409" ]] || {
  echo "Expected closed session frame to return 409, got $CLOSED_FRAME_STATUS" >&2
  exit 1
}

EVENTS_JSON=$(curl -fsS "$API_URL/api/v1/experience/events?dataMode=REAL_ONLY&limit=100" \
  -H "Authorization: Bearer $TOKEN")
EVENT_COUNT=$(jq --arg id "$SESSION_ID" '[.[] | select(.sessionId == $id)] | length' <<<"$EVENTS_JSON")
[[ "$EVENT_COUNT" == "3" ]] || {
  echo "Expected 3 persisted REAL_ONLY events, got $EVENT_COUNT" >&2
  exit 1
}

echo "PASS session=$SESSION_ID frames=3 events=$EVENT_COUNT unauthorized=403 duplicate=409 closed-frame=409"

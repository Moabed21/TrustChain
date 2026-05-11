from fastapi import APIRouter, Depends
from app.database import get_db
from app.middleware.auth_middleware import require_admin

router = APIRouter()

@router.get("")
async def get_activities(
    page: int = 1,
    limit: int = 50,
    current_user: dict = Depends(require_admin)
):
    """Admin-only — returns the activity log, most recent first."""
    db = get_db()
    skip = (page - 1) * limit

    activities = (
        await db.activities.find()
        .sort("date", -1)  # newest first
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    for activity in activities:
        activity["_id"] = str(activity["_id"])
        # Format date as ISO string for JSON serialisation
        if activity.get("date"):
            activity["date"] = activity["date"].isoformat()

    return activities

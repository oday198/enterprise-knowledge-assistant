from fastapi import Header

from app.core.exceptions import ValidationAppException


def get_workspace_id(x_workspace_id: str = Header(..., alias="X-Workspace-ID")) -> str:
    workspace_id = x_workspace_id.strip()

    if not workspace_id:
        raise ValidationAppException("X-Workspace-ID header is required.")

    return workspace_id
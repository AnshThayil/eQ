from datetime import date, timedelta


def next_occurrence(weekday, from_date=None):
    """Return the next date (>= from_date) that falls on ``weekday``.

    ``weekday`` follows Python's convention: 0=Monday ... 6=Sunday.
    If today already matches ``weekday``, today is returned.
    """
    if weekday is None:
        return None
    if from_date is None:
        from_date = date.today()
    days_ahead = (weekday - from_date.weekday()) % 7
    return from_date + timedelta(days=days_ahead)


def computed_reset_date(setting_day, queue_position, from_date=None):
    """Compute the auto-scheduled reset date for a wall.

    The wall at ``queue_position`` 0 (up next) resets on the next
    occurrence of the gym's ``setting_day``; each subsequent wall in the
    queue resets one week later.
    """
    base = next_occurrence(setting_day, from_date)
    if base is None:
        return None
    return base + timedelta(weeks=queue_position)

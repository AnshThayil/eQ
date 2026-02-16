# Generated data migration to populate ascent points based on boulder grades

from django.db import migrations


def populate_ascent_points(apps, schema_editor):
    """Calculate and set points for all existing ascents based on their boulder's grade."""
    Ascent = apps.get_model('logger', 'Ascent')
    
    # Point values for each grade level (matching Ascent.GRADE_POINTS)
    GRADE_POINTS = {
        "L1": 10,
        "L2": 20,
        "L3": 30,
        "L4": 40,
        "L5": 50,
        "L6": 60,
        "L7": 70,
        "L8": 80,
    }
    
    # Update all ascents
    ascents = Ascent.objects.select_related('boulder').all()
    updated_count = 0
    
    for ascent in ascents:
        boulder_grade = ascent.boulder.setter_grade
        points = GRADE_POINTS.get(boulder_grade, 0)
        if ascent.points != points:
            ascent.points = points
            ascent.save(update_fields=['points'])
            updated_count += 1
    
    print(f"Updated {updated_count} ascents with calculated points.")


def reverse_populate_ascent_points(apps, schema_editor):
    """Reset all ascent points to 0."""
    Ascent = apps.get_model('logger', 'Ascent')
    Ascent.objects.all().update(points=0)


class Migration(migrations.Migration):

    dependencies = [
        ('logger', '0004_remove_boulder_concensus_grade_and_more'),
    ]

    operations = [
        migrations.RunPython(populate_ascent_points, reverse_populate_ascent_points),
    ]

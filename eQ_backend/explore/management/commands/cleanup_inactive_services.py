"""
Django management command to delete all inactive ServiceGroups and their associated Services.

Usage:
    python manage.py cleanup_inactive_services [--dry-run]

Options:
    --dry-run: Show what would be deleted without actually deleting
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from explore.models import ServiceGroup


class Command(BaseCommand):
    help = 'Delete all inactive ServiceGroups and their associated Services'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all inactive service groups
        inactive_service_groups = ServiceGroup.objects.filter(is_active=False)
        inactive_count = inactive_service_groups.count()
        
        if inactive_count == 0:
            self.stdout.write(self.style.SUCCESS('No inactive service groups found. Nothing to delete.'))
            return
        
        # Count associated services that will be deleted
        total_services = 0
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write('INACTIVE SERVICE GROUPS TO BE DELETED:')
        self.stdout.write('='*60)
        
        for service_group in inactive_service_groups:
            service_count = service_group.variations.count()
            total_services += service_count
            
            self.stdout.write(f'\n📦 {service_group.name} (ID: {service_group.yoactiv_service_id})')
            self.stdout.write(f'   Type: {service_group.get_service_type_display()}')
            self.stdout.write(f'   Associated variations: {service_count}')
            
            if service_count > 0:
                for service in service_group.variations.all():
                    self.stdout.write(f'     - {service.name} (₹{service.price})')
        
        self.stdout.write('\n' + '='*60)
        self.stdout.write('SUMMARY:')
        self.stdout.write('='*60)
        self.stdout.write(f'Service Groups to delete: {inactive_count}')
        self.stdout.write(f'Service variations to delete: {total_services}')
        self.stdout.write('='*60)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n[DRY RUN] No changes made. Remove --dry-run to actually delete.'))
            return
        
        # Confirm deletion
        self.stdout.write(self.style.WARNING('\n⚠️  WARNING: This will permanently delete the above items!'))
        confirm = input('Type "DELETE" to confirm: ')
        
        if confirm != 'DELETE':
            self.stdout.write(self.style.ERROR('Deletion cancelled.'))
            return
        
        # Perform deletion
        try:
            with transaction.atomic():
                deleted_count, deleted_details = inactive_service_groups.delete()
                
                self.stdout.write('\n' + self.style.SUCCESS('✓ Deletion completed successfully!'))
                self.stdout.write('\nDeleted objects:')
                for model, count in deleted_details.items():
                    self.stdout.write(f'  - {model}: {count}')
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n✗ Deletion failed: {e}'))
            import traceback
            traceback.print_exc()

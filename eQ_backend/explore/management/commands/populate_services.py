"""
Django management command to populate ServiceGroup and Service models 
from YoActiv API data.

Usage:
    python manage.py populate_services [--clear]

Options:
    --clear: Delete all existing services and service groups before populating
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from explore.models import ServiceGroup, Service
from explore.yoactiv_admin_integration import (
    fetch_yoactiv_services,
    fetch_yoactiv_variations,
    YoActivAPIError
)


class Command(BaseCommand):
    help = 'Fetch all services and variations from YoActiv and populate the database (all marked as inactive)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete all existing services and service groups before populating',
        )

    def handle(self, *args, **options):
        clear_existing = options['clear']
        
        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing services and service groups...'))
            Service.objects.all().delete()
            ServiceGroup.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared existing data'))
        
        try:
            # Fetch all services from YoActiv
            self.stdout.write('Fetching services from YoActiv...')
            services = fetch_yoactiv_services()
            self.stdout.write(self.style.SUCCESS(f'Found {len(services)} services'))
            
            service_groups_created = 0
            services_created = 0
            service_groups_updated = 0
            services_updated = 0
            errors = []
            
            # Process each service
            for service_data in services:
                service_id = service_data['serviceId']
                service_name = service_data['serviceName']
                
                self.stdout.write(f'\nProcessing: {service_name} (ID: {service_id})')
                
                # Determine service type based on name (you can adjust this logic)
                service_type = self._determine_service_type(service_name)
                
                try:
                    with transaction.atomic():
                        # Create or update ServiceGroup by YoActiv ID + name.
                        # YoActiv IDs are intentionally allowed to repeat across groups.
                        service_group, created = ServiceGroup.objects.update_or_create(
                            yoactiv_service_id=service_id,
                            name=service_name,
                            defaults={
                                'service_type': service_type,
                                'is_active': False,  # All marked as inactive
                            }
                        )
                        
                        if created:
                            service_groups_created += 1
                            self.stdout.write(self.style.SUCCESS(f'  ✓ Created ServiceGroup: {service_name}'))
                        else:
                            service_groups_updated += 1
                            self.stdout.write(f'  → Updated ServiceGroup: {service_name}')
                        
                        # Fetch variations for this service
                        try:
                            variations = fetch_yoactiv_variations(service_id)
                            self.stdout.write(f'  Found {len(variations)} variations')
                            
                            # Process each variation
                            for variation_data in variations:
                                variation_name = variation_data['ServiceVariation']
                                variation_amount = variation_data['amount']
                                variation_id = variation_data['id']
                                
                                # Determine access type and extract session info
                                access_type, num_sessions, duration_days = self._parse_variation_details(
                                    variation_name, 
                                    service_name
                                )
                                
                                # Create or update Service (variation)
                                service, created = Service.objects.update_or_create(
                                    service_group=service_group,
                                    yoactiv_service_variation_id=variation_id,
                                    defaults={
                                        'name': variation_name,
                                        'access_type': access_type,
                                        'num_sessions': num_sessions,
                                        'price': variation_amount,
                                        'duration_days': duration_days,
                                        'is_active': False,
                                    }
                                )
                                
                                if created:
                                    services_created += 1
                                    self.stdout.write(
                                        self.style.SUCCESS(
                                            f'    ✓ Created variation: {variation_name} (₹{variation_amount})'
                                        )
                                    )
                                else:
                                    services_updated += 1
                                    self.stdout.write(
                                        f'    → Updated variation: {variation_name} (₹{variation_amount})'
                                    )
                        
                        except YoActivAPIError as e:
                            error_msg = f'Failed to fetch variations for {service_name}: {e}'
                            errors.append(error_msg)
                            self.stdout.write(self.style.ERROR(f'  ✗ {error_msg}'))
                
                except Exception as e:
                    error_msg = f'Failed to process service {service_name}: {e}'
                    errors.append(error_msg)
                    self.stdout.write(self.style.ERROR(f'  ✗ {error_msg}'))
            
            # Print summary
            self.stdout.write('\n' + '='*60)
            self.stdout.write(self.style.SUCCESS('SUMMARY'))
            self.stdout.write('='*60)
            self.stdout.write(f'ServiceGroups created: {service_groups_created}')
            self.stdout.write(f'ServiceGroups updated: {service_groups_updated}')
            self.stdout.write(f'Services (variations) created: {services_created}')
            self.stdout.write(f'Services (variations) updated: {services_updated}')
            
            if errors:
                self.stdout.write(f'\n{self.style.ERROR(f"Errors: {len(errors)}")}')
                for error in errors:
                    self.stdout.write(self.style.ERROR(f'  - {error}'))
            else:
                self.stdout.write(self.style.SUCCESS('\nAll services imported successfully!'))
                self.stdout.write(self.style.WARNING(
                    '\nNote: All services are marked as INACTIVE. '
                    'Go to Django admin to activate the ones you need.'
                ))
        
        except YoActivAPIError as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch services from YoActiv: {e}'))
            self.stdout.write(self.style.ERROR('Please check your YoActiv API credentials and connection.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Unexpected error: {e}'))
            import traceback
            traceback.print_exc()
    
    def _determine_service_type(self, service_name: str) -> str:
        """
        Determine service type based on service name.
        You can customize this logic based on your naming conventions.
        """
        name_lower = service_name.lower()
        
        if 'membership' in name_lower or 'member' in name_lower:
            return 'membership'
        elif any(keyword in name_lower for keyword in ['class', 'yoga', 'workout', 'training', 'session']):
            return 'class'
        elif any(keyword in name_lower for keyword in ['event', 'workshop', 'seminar']):
            return 'event'
        else:
            # Default to membership
            return 'membership'
    
    def _parse_variation_details(self, variation_name: str, service_name: str):
        """
        Parse variation name to extract access type, number of sessions, and duration.
        Returns (access_type, num_sessions, duration_days).
        
        You can customize this logic based on your naming conventions.
        """
        name_lower = variation_name.lower()
        
        # Check for session-based variations (e.g., "10 Sessions", "5 Classes")
        import re
        session_match = re.search(r'(\d+)\s*(session|class|visit)', name_lower)
        if session_match:
            num_sessions = int(session_match.group(1))
            return ('sessions', num_sessions, None)
        
        # Check for unlimited
        if 'unlimited' in name_lower:
            # Try to extract duration (e.g., "1 Month Unlimited", "3 Months Unlimited")
            duration_match = re.search(r'(\d+)\s*(month|day|week|year)', name_lower)
            duration_days = None
            if duration_match:
                num = int(duration_match.group(1))
                unit = duration_match.group(2)
                if unit == 'month':
                    duration_days = num * 30
                elif unit == 'week':
                    duration_days = num * 7
                elif unit == 'day':
                    duration_days = num
                elif unit == 'year':
                    duration_days = num * 365
            
            return ('unlimited', None, duration_days)
        
        # Check for single day access
        if any(keyword in name_lower for keyword in ['single day', 'day pass', '1 day']):
            return ('single_day', None, 1)
        
        # Try to extract duration for time-based services (e.g., "1 Month", "3 Months")
        duration_match = re.search(r'(\d+)\s*(month|day|week|year)', name_lower)
        if duration_match:
            num = int(duration_match.group(1))
            unit = duration_match.group(2)
            duration_days = None
            if unit == 'month':
                duration_days = num * 30
            elif unit == 'week':
                duration_days = num * 7
            elif unit == 'day':
                duration_days = num
            elif unit == 'year':
                duration_days = num * 365
            
            return ('unlimited', None, duration_days)
        
        # Default: unlimited access with no specified duration
        return ('unlimited', None, None)

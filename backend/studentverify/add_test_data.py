from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from student.models import Student

class Command(BaseCommand):
    help = 'Creates test data for the application'

    def handle(self, *args, **kwargs):
        # Create test admin user
        admin_user = User.objects.create_user(
            username='admin',
            password='admin123',
            is_staff=True,
            is_superuser=True
        )
        
        # Create test students
        students_data = [
            {
                'username': 'student1',
                'password': 'student123',
                'name': 'John Doe',
                'email': 'john.doe@example.com',
                'mobile_number': '9876543210',
                'whatsapp_number': '9876543210',
                'father_mobile_number': '9876543211',
                'field_of_study': 'Computer Science',
                'branch': 'Software Engineering'
            },
            {
                'username': 'student2',
                'password': 'student123',
                'name': 'Jane Smith',
                'email': 'jane.smith@example.com',
                'mobile_number': '9876543220',
                'whatsapp_number': '9876543220',
                'father_mobile_number': '9876543221',
                'field_of_study': 'Engineering',
                'branch': 'Mechanical Engineering'
            }
        ]
        
        for student_data in students_data:
            username = student_data.pop('username')
            password = student_data.pop('password')
            
            user = User.objects.create_user(
                username=username,
                password=password
            )
            
            Student.objects.create(
                user=user,
                **student_data
            )
        
        self.stdout.write(self.style.SUCCESS('Test data created successfully!'))



# # add_test_data.py - Script to add test data
# from django.contrib.auth.models import User
# from student.models import Student

# def create_test_data():
#     # Create test admin user
#     admin_user = User.objects.create_user(
#         username='admin',
#         password='admin123',
#         is_staff=True,
#         is_superuser=True
#     )
    
#     # Create test students
#     students_data = [
#         {
#             'username': 'student1',
#             'password': 'student123',
#             'name': 'John Doe',
#             'email': 'john.doe@example.com',
#             'mobile_number': '9876543210',
#             'whatsapp_number': '9876543210',
#             'father_mobile_number': '9876543211',
#             'field_of_study': 'Computer Science',
#             'branch': 'Software Engineering'
#         },
#         {
#             'username': 'student2',
#             'password': 'student123',
#             'name': 'Jane Smith',
#             'email': 'jane.smith@example.com',
#             'mobile_number': '9876543220',
#             'whatsapp_number': '9876543220',
#             'father_mobile_number': '9876543221',
#             'field_of_study': 'Engineering',
#             'branch': 'Mechanical Engineering'
#         }
#     ]
    
#     for student_data in students_data:
#         username = student_data.pop('username')
#         password = student_data.pop('password')
        
#         user = User.objects.create_user(
#             username=username,
#             password=password
#         )
        
#         Student.objects.create(
#             user=user,
#             **student_data
#         )
    
#     print("Test data created successfully!")

# if __name__ == '__main__':
#     create_test_data()
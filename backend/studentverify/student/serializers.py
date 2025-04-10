from rest_framework import serializers
from .models import Student, UpdateHistory

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'roll_no', 'name', 'email', 'mobile_number', 
                 'father_mobile_number', 'date_of_birth', 'address', 
                 'field_of_study', 'branch', 'is_data_verified', 
                 'is_mobile_verified']
        read_only_fields = ['id', 'is_data_verified', 'is_mobile_verified']


class UpdateHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UpdateHistory
        fields = ['id', 'student_id', 'field_name', 'old_value', 'new_value', 'update_date']
        read_only_fields = ['id', 'update_date']
        
# from rest_framework import serializers
# from .models import Student

# class StudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student
#         fields = [
#             'id', 'roll_no', 'name', 'email', 'mobile_number', 
#             'father_mobile_number', 'date_of_birth', 'address',
#             'field_of_study', 'branch', 'is_data_verified', 'is_mobile_verified'
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }
    
#     def to_representation(self, instance):
#         # Exclude password from response
#         representation = super().to_representation(instance)
#         return representation
    
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Student

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username']

# class StudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student
#         fields = [
#             'id', 'name', 'email', 'mobile_number', 'whatsapp_number',
#             'father_mobile_number', 'field_of_study', 'branch',
#             'is_verified', 'is_mobile_verified'
#         ]
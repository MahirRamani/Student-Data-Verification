from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import Student, UpdateHistory
from .serializers import StudentSerializer, UpdateHistorySerializer

@api_view(['POST'])
def login_view(request):
    roll_no = request.data.get('roll_no')
    password = request.data.get('password')
    
    try:
        student = Student.objects.get(roll_no=roll_no)
        
        # Since the current implementation uses plain text passwords, 
        # we're keeping that for compatibility
        if password == student.password:
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    except Student.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    lookup_field = 'roll_no'
    
    # Update in StudentViewSet.perform_update in backend 
    def perform_update(self, serializer):
        # Get the original instance before update
        original_instance = self.get_object()
        original_data = StudentSerializer(original_instance).data
        
        # Save the updated instance
        instance = serializer.save()
        
        # If any data has changed, mark as not verified
        has_changes = False
        new_data = serializer.data
        
        for field in new_data:
            if field in original_data and original_data[field] != new_data[field]:
                has_changes = True
                UpdateHistory.objects.create(
                    student=instance,
                    field_name=field,
                    old_value=str(original_data[field]),
                    new_value=str(new_data[field])
                )
    
        if has_changes:
            # Mark data as not verified when updated
            instance.is_data_verified = False
            
            # If mobile number has changed, also mark mobile as not verified
            if original_data['mobile_number'] != instance.mobile_number:
                instance.is_mobile_verified = False
            
            instance.save()
        
    @action(detail=True, methods=['post'])
    def verify(self, request, roll_no=None):
        student = self.get_object()
        student.is_mobile_verified = True
        # Cannot verify if mobile is not verified
        if not student.is_mobile_verified:
            return Response(
                {'error': 'Mobile number must be verified first'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        student.is_data_verified = True
        student.save()
        print("data verified")
        return Response({'status': 'data verified'})
    
    @action(detail=True, methods=['get'])
    def history(self, request, roll_no=None):
        student = self.get_object()
        history = UpdateHistory.objects.filter(student=student)
        serializer = UpdateHistorySerializer(history, many=True)
        return Response(serializer.data)
    

    # def perform_update(self, serializer):
    #     # Get the original instance before update
    #     original_instance = self.get_object()
    #     original_data = StudentSerializer(original_instance).data
        
    #     # Save the updated instance
    #     instance = serializer.save()
        
    #     # Check if mobile number is changed
    #     if original_data['mobile_number'] != instance.mobile_number:
    #         instance.is_mobile_verified = False
    #         instance.save()
            
    #     instance.is_mobile_verified = False
    #     # Mark data as not verified when updated
    #     instance.is_data_verified = False
    #     instance.save()
        
    #     # Create update history records for changed fields
    #     new_data = serializer.data
    #     for field in new_data:
    #         if field in original_data and original_data[field] != new_data[field]:
    #             UpdateHistory.objects.create(
    #                 student=instance,
    #                 field_name=field,
    #                 old_value=str(original_data[field]),
    #                 new_value=str(new_data[field])
    #             )
    


# from django.shortcuts import render

# from rest_framework import status, viewsets
# from rest_framework.decorators import api_view, action
# from rest_framework.response import Response
# from django.contrib.auth.hashers import check_password
# from .models import Student
# from .serializers import StudentSerializer

# @api_view(['POST'])
# def login_view(request):
#     print("Login view called")
#     roll_no = request.data.get('roll_no')
#     password = request.data.get('password')

#     print("Roll No:", roll_no, "lallu:", password)
    
#     try:
#         print("student found",Student.objects.all().count())
#         print("student found",Student.objects.all())
#         student = Student.objects.get(roll_no=roll_no)
#         if password == student.password:
#             serializer = StudentSerializer(student)
#             return Response(serializer.data)
#         else:
#             return Response(
#                 {'error': 'Invalid credentials'}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
#     except Student.DoesNotExist:
#         return Response(
#             {'error': 'Student not found'}, 
#             status=status.HTTP_404_NOT_FOUND
#         )

# class StudentViewSet(viewsets.ModelViewSet):
#     queryset = Student.objects.all()
#     serializer_class = StudentSerializer
    
#     def perform_create(self, serializer):
#         # Hash the password before saving
#         password = serializer.validated_data.get('password')
#         instance = serializer.save()
#         if password:
#             instance.set_password(password)
#             instance.save()
    
#     def perform_update(self, serializer):
#         # Hash the password if it's being updated
#         password = serializer.validated_data.get('password')
#         instance = serializer.save()
#         if password:
#             instance.set_password(password)
#             instance.save()
    
#     @action(detail=True, methods=['post'])
#     def verify(self, request, pk=None):
#         student = self.get_object()
#         student.is_data_verified = True
#         student.save()
#         return Response({'status': 'data verified'})
    
#     @action(detail=True, methods=['post'])
#     def verify_mobile(self, request, pk=None):
#         student = self.get_object()
#         student.is_mobile_verified = True
#         student.save()
#         return Response({'status': 'mobile verified'})
    
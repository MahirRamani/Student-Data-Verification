from django.db import models
from django.contrib.auth.hashers import make_password

class Student(models.Model):
    roll_no = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Stored as plain text in the provided code, but should be hashed
    mobile_number = models.CharField(max_length=15)
    father_mobile_number = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    address = models.TextField()
    field_of_study = models.CharField(max_length=100)
    branch = models.CharField(max_length=100)
    is_data_verified = models.BooleanField(default=False)
    is_mobile_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save(update_fields=['password'])
    
    def __str__(self):
        return f"{self.roll_no} - {self.name}"


class UpdateHistory(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='update_history')
    field_name = models.CharField(max_length=50)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    update_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-update_date']
    
    def __str__(self):
        return f"{self.student.roll_no} - {self.field_name} update on {self.update_date}"


class OTPVerification(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='otp_verifications')
    otp = models.CharField(max_length=6)
    mobile_number = models.CharField(max_length=15)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"OTP for {self.student.roll_no}"
        
        
# # student/models.py - Django Student Model

# from django.db import models
# from django.contrib.auth.models import User

# class Student(models.Model):
#     roll_no = models.CharField(max_length=50)
#     password = models.CharField(max_length=128)  # For storing hashed password
#     name = models.CharField(max_length=100)
#     mobile_number = models.CharField(max_length=25)
#     email = models.EmailField()
#     father_mobile_number = models.CharField(max_length=25)
#     date_of_birth = models.DateField()  # New field for date of birth
#     address = models.TextField()  # New field for address
#     field_of_study = models.CharField(max_length=100)
#     branch = models.CharField(max_length=100)
#     is_data_verified = models.BooleanField(default=False)
#     is_mobile_verified = models.BooleanField(default=False)
    
#     def __str__(self):
#         return self.name
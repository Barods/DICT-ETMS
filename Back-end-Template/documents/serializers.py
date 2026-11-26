from rest_framework import serializers
from pathlib import Path
from .models import  Document

class  DocumentSerializer(serializers.ModelSerializer):
    def validate_file(self, uploaded_file):
        allowed_extensions = {'.pdf', '.doc', '.docx', '.xls', '.xlsx'}
        if uploaded_file and Path(uploaded_file.name).suffix.lower() not in allowed_extensions:
            raise serializers.ValidationError('Only PDF, Word, and Excel files are allowed.')
        if uploaded_file and uploaded_file.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Files must be 10 MB or smaller.')
        return uploaded_file

    class Meta:
        model =  Document
        fields = ['id','userID','tracknumber', 'title', 'type', 'requestor','to','position', 'message', 'remarks', 'file', 'datesubmitted','signedBy', 'status','updatedAt']

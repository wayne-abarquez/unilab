from .models import Branch, BranchType
from wtforms_alchemy import ModelForm
from wtforms.fields import Field, StringField, SelectField, TextAreaField, DateField, FloatField
from wtforms import validators


class AddBranchForm(ModelForm):
    class Meta:
        model = Branch
        exclude = ['latlng', 'status']

    name = StringField(u'Name', [validators.required(), validators.length(min=3)])
    type = SelectField(u'Branch Type', choices=BranchType.tuple_options)
    address = StringField(u'Address', [validators.required()])
    average_monthly_income = FloatField(u'Average Monthly Income', [validators.optional()])
    average_patrons = FloatField(u'Average Ppatrons', [validators.optional()])
    remarks = TextAreaField(u'Remarks', [validators.optional(), validators.length(min=3)])
    operation_started_date = DateField([validators.required()])

    def __init__(self, *args, **kwargs):
        super(AddBranchForm, self).__init__(*args, **kwargs)

    def validate(self):
        # form_data = self.data
        is_valid_data = True

        rv = ModelForm.validate(self)
        if not rv:
            is_valid_data = False

        # if form_data['latlng'] is None:
        #     self.latlng.errors.append('Branch location is Required')
        #     is_valid_data = False

        return is_valid_data

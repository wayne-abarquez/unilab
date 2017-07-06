# from .models import Solar
# from wtforms_alchemy import ModelForm
# from flask_wtf import Form
# from wtforms.fields import SelectField, StringField, TextAreaField
# from wtforms import validators
# from app.constants import solar_constants
#
#
# class AddSolarForm(ModelForm):
#     class Meta:
#         model = Solar
#         exclude = ['coordinates', 'state', 'area']
#
#     project_name = StringField(u'Site / Project Name', [validators.required(), validators.length(min=3)])
#     state = SelectField(u'State', choices=solar_constants.states)
#     county = StringField(u'County', [validators.required()])
#     client_name = StringField(u'Client Name', [validators.required()])
#     client_contact_no = StringField(u'Client Contact No.', [validators.optional()])
#     site_description = TextAreaField(u'Site Description', [validators.optional(), validators.length(min=10)])
#     coordinates = StringField([validators.required()])
#
#     def __init__(self, *args, **kwargs):
#         super(AddSolarForm, self).__init__(*args, **kwargs)
#
#     def validate(self):
#         form_data = self.data
#         is_valid_data = True
#
#         rv = ModelForm.validate(self)
#         if not rv:
#             is_valid_data = False
#
#         if form_data['coordinates'] is None:
#             self.coordinates.errors.append('Coordinates is Required')
#             is_valid_data = False
#
#         return is_valid_data
#
#
# class UpdatePhotoCaptionForm(ModelForm):
#     caption = StringField('username', validators=[validators.required(), validators.length(min=3)])
#

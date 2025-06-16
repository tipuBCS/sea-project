from pynamodb.attributes import Attribute
from pynamodb.constants import STRING


class EnumAttribute(Attribute):
    attr_type = STRING

    def __init__(self, enum_class, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.enum_class = enum_class

    def serialize(self, value):
        if isinstance(value, self.enum_class):
            return value.value
        return value

    def deserialize(self, value):
        return self.enum_class(value)

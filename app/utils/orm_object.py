class OrmObject(object):
    """
    Based on:
    http://www.sqlalchemy.org/trac/wiki/UsageRecipes/GenericOrmBaseClass
    """

    def __init__(self, **kw):
        for key in kw:
            if key in self.__table__.c:
                setattr(self, key, kw[key])
            else:
                raise AttributeError('Cannot set attribute which is' +
                                     'not column in mapped table: %s' % (key,))

    def __repr__(self):
        atts = []
        for key in self.__table__.c.keys():
            if key in self.__dict__:
                if not (hasattr(self.__table__.c.get(key).default, 'arg') and
                                getattr(self.__table__.c.get(key).default, 'arg') == getattr(self, key)):
                    atts.append((key, getattr(self, key)))

        return self.__class__.__name__ + '(' + ', '.join(x[0] + '=' + repr(x[1]) for x in atts) + ')'

    def to_dict(self):
        d = {}
        for k, v in self.__dict__.iteritems():
            if not k.startswith('_'):
                d[k] = v

        return d

    def update_from_dict(self, data, exception):
        for k, v in data.iteritems():
            if k not in exception and hasattr(self, k):
                setattr(self, k, v)


    @classmethod
    def from_dict(cls, data):
        U = cls()
        for k, v in data.iteritems():
            if hasattr(U, k):
                setattr(U, k, v)

        return U

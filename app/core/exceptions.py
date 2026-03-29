class AppException(Exception):
    pass


class ValidationAppException(AppException):
    pass


class NotFoundAppException(AppException):
    pass


class ExternalServiceAppException(AppException):
    pass

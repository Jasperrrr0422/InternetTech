from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class HotelPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):  
        return Response({    
            'data': data,  
            'pagination': {
                    'total': self.page.paginator.count,  # 总条数  
                    'page_size': self.page_size,  # 每页条数  
                    'current_page': self.page.number,  # 当前页码  
                    'total_pages': self.page.paginator.num_pages,  # 总页数  
                    'has_next': self.page.has_next(),  # 是否有下一页  
                    'has_previous': self.page.has_previous(),  # 是否有上一页  
                },
            'data_count': len(data)
        })  
// 订单状态映射：供 OrderList, OrderDetail, SellerOrderManage 共用
export const ORDER_STATUS_MAP = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' }

export function orderStatusText(status) {
  return ORDER_STATUS_MAP[status] || '未知'
}

import React from "react";
import { useToast } from "@chakra-ui/toast";
import _isEmpty from "lodash/isEmpty";

import { CartInfo } from "models/Cart";
import { useMutation } from "react-query";
import { addToCart, ADD_TO_CART_URI } from "services/cart";
import { ErrorCode, ErrorMap } from "constants/error";
type CartContext = {
  updateCartItem: (productId: string, qty: number) => void;
  numberOfItems: number;
  setCartInfo: (next: CartInfo) => void;
};

const CartCtx = React.createContext({} as CartContext);

export const CartProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { mutate: addToTheCart } = useMutation({
    mutationKey: ADD_TO_CART_URI,
    mutationFn: addToCart,
  });

  const [cartInfo, setCartInfo] = React.useState<CartInfo>();
  const numberOfItems = React.useMemo(
    () => cartInfo?.cart?.total_items ?? 0,
    [cartInfo]
  );

  const updateCartItem = React.useCallback((productId: string, qty: number) => {
    addToTheCart(
      { productID: productId, qty },
      {
        onSuccess(data) {
          if (_isEmpty(data)) {
            toast({
              title: ErrorMap[ErrorCode._0],
              status: "error",
              variant: "top-accent",
              duration: 1000,
              isClosable: true,
            });
            return;
          }
          const curr = { ...cartInfo };
          const next: CartInfo = {
            cart: {
              total_items: data.total_item,
              total_price: data.total_price,
            },
            cart_item_groups: curr.cart_item_groups ?? [],
          };
          setCartInfo(next);
        },
        onError(error) {
          console.log("error:", error);
        },
      }
    );
  }, []);

  return (
    <CartCtx.Provider value={{ updateCartItem, numberOfItems, setCartInfo }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCartCtx = () => React.useContext(CartCtx);
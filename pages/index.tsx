import React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  VStack,
  Box,
  Grid,
  GridItem,
  Image,
  Avatar,
  SimpleGrid,
  Text,
  Button,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
import { dehydrate, QueryClient, useQuery } from "react-query";
import VisibilitySensor from "react-visibility-sensor";

import { fetchHome, FETCH_HOME_URI } from "services/public";
import { HomeInfo } from "models/request-response/Home";
import { ProductCategory } from "models/ProductCategory";
import MetaCard from "components/MetaCard";
import ProductItem from "components/ProductItem";
import { fetchProducts, FETCH_PRODUCT_URI } from "services/product";
import { Product } from "models/Product";
import { ALLOWED_FETCH_MORE_TIME, PAGE_SIZE } from "constants/platform";

const Home: NextPage = () => {
  const router = useRouter();
  const [isBottom, setBottomState] = React.useState(false);
  const [productPage, setProductPage] = React.useState(1);
  const { data, isLoading } = useQuery<HomeInfo>(FETCH_HOME_URI, fetchHome);

  const {
    data: products,
    isLoading: productsLoading,
    isPreviousData: isOldProductData,
    isRefetching: isProductRefetching,
    refetch: doFetchProducts,
  } = useQuery(FETCH_PRODUCT_URI, () =>
    fetchProducts({ page: productPage, pageSize: PAGE_SIZE })
  );

  const [productData, setProductData] = React.useState<Product[]>([]);

  const productCategories = React.useMemo(() => {
    if (!data?.product_categories) return [];
    return data.product_categories.sort(
      (a: ProductCategory, b: ProductCategory) => {
        const aP = a.priority ?? 0;
        const bP = b.priority ?? 0;
        if (aP < bP) return 1;
        if (aP > bP) return -1;
        return 0;
      }
    );
  }, [data?.product_categories]);

  const totalAvailableProducts = React.useMemo(
    () => productData?.length ?? 0,
    [productData?.length]
  );

  const isReachedLimit = React.useMemo(
    () => totalAvailableProducts / PAGE_SIZE >= ALLOWED_FETCH_MORE_TIME,
    [totalAvailableProducts]
  );

  React.useEffect(() => {
    if (!isBottom) return;
    setProductPage((prev) => prev + 1);
  }, [isBottom]);

  React.useEffect(() => {
    if (productPage === 1 || isReachedLimit) return;
    doFetchProducts();
  }, [productPage, doFetchProducts, isReachedLimit]);

  React.useEffect(() => {
    if (isOldProductData || isProductRefetching || !products || isReachedLimit)
      return;
    setProductData((prev) => prev.concat(products));
  }, [isProductRefetching, isOldProductData, products, isReachedLimit]);

  function triggerBottomState(isVisible: boolean) {
    setBottomState(isVisible);
  }

  if (isLoading || productsLoading) return null;
  if (!data || !products) return null;

  return (
    <VStack h="fit-content" w="full" spacing={10} py={10}>
      {/* Banner */}
      {data?.banners && (
        <Grid columnGap={2} templateColumns="repeat(4, 1fr)" w="full" h="auto">
          <GridItem colSpan={3} w="full">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={50}
              slidesPerView={1}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              navigation
            >
              {data?.banners &&
                data.banners.map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <Box bg="brand.500" w="full" h={300}>
                      <Image
                        src={banner.edges?.cover?.file_thumbnail}
                        alt="a-shop-in-vs"
                        w="full"
                        maxH="full"
                        maxW="full"
                        objectFit="cover"
                      />
                    </Box>
                  </SwiperSlide>
                ))}
            </Swiper>
          </GridItem>
          <GridItem colSpan={1} w="full">
            <VStack w="full" h={300}>
              <Box w="full" h="50%">
                <Image
                  src={
                    data?.banners[1].edges?.cover?.file_thumbnail ??
                    "https://fakeimg.pl/300/"
                  }
                  alt="a-shop-in-vs"
                  maxH="full"
                  maxW="full"
                  w="full"
                />
              </Box>
              <Box w="full" h="47%">
                <Image
                  src={
                    data?.banners[2].edges?.cover?.file_thumbnail ??
                    "https://fakeimg.pl/300/"
                  }
                  alt="a-shop-in-vs"
                  maxH="full"
                  maxW="full"
                  w="full"
                />
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      )}

      {/* Hot deals */}
      <MetaCard
        title="Hot deals"
        titleBg="red.500"
        titleColor="white"
        noBody
        bodyProps={{
          position: "relative",
          bgGradient: "linear(to-b, brand.100, brand.300, brand.500)",
          border: "1px solid",
          borderColor: "gray.300",
          borderBottomRadius: "md",
          borderTopRightRadius: "md",
        }}
      >
        <>
          <Box
            bg={"url(/fire-gif.gif)"}
            bgSize="cover"
            bgPosition={"center"}
            bgRepeat={"no-repeat"}
            position="absolute"
            top="-50px"
            left="100px"
            w="24px"
            h="24px"
            transform="rotate(25deg)"
          />
          <SimpleGrid px={3} gap={3} columns={[1, 2, 4, 6]}>
            {data?.hot_deals &&
              data?.hot_deals.map((prod, idx) => (
                <ProductItem isHot key={idx} product={prod} />
              ))}
          </SimpleGrid>
        </>
      </MetaCard>

      <MetaCard title="Danh mục sản phẩm">
        <SimpleGrid columns={[4, 6, 8]} w="full">
          {productCategories.map((cate, idx) => (
            <Box
              key={idx}
              p={2}
              d="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
            >
              <Avatar
                size="md"
                name={cate.category_name}
                src={cate.edges?.icon?.file_thumbnail}
                mb={2}
              />
              <Text maxWidth="full" fontSize="xs" isTruncated>
                {cate.category_name}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </MetaCard>

      {/* Highlight products */}
      <MetaCard
        title="Sản phẩm nổi bật"
        titleBg="brand.500"
        titleColor="white"
        bodyProps={{
          bgGradient: "linear(to-t, red.100, red.200, blue.300, blue.400)",
          border: "1px solid",
          borderColor: "gray.200",
          p: 3,
        }}
        noBody
      >
        <SimpleGrid gap={3} columns={[1, 2, 4, 6]}>
          {data?.highlight_products &&
            data?.highlight_products.map((prod, idx) => (
              <ProductItem key={idx} product={prod} />
            ))}
        </SimpleGrid>
      </MetaCard>

      {/* All products */}
      <MetaCard
        title="Gợi ý hôm nay"
        bodyProps={{
          bg: "white",
        }}
        noBody
      >
        <SimpleGrid rowGap={3} columnGap={1} columns={[1, 2, 4, 6]}>
          {productData &&
            productData.map((prod, idx) => (
              <ProductItem key={idx} product={prod} />
            ))}
        </SimpleGrid>
      </MetaCard>

      <VisibilitySensor onChange={triggerBottomState}>
        <Stack direction="row" h={2}>
          {(!isReachedLimit || isProductRefetching) && (
            <Spinner
              colorScheme="brand"
              color="brand.500"
              speed="1s"
              size="md"
              emptyColor="gray.300"
            />
          )}
        </Stack>
      </VisibilitySensor>

      {isReachedLimit && (
        <Button
          p={3}
          fontWeight="medium"
          w="25%"
          size="md"
          onClick={() => router.push("/products")}
        >
          Xem thêm
        </Button>
      )}
    </VStack>
  );
};

export async function getServerSideProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(FETCH_HOME_URI, fetchHome);
  await queryClient.prefetchQuery(FETCH_PRODUCT_URI, () =>
    fetchProducts({ pageSize: PAGE_SIZE })
  );
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

export default Home;

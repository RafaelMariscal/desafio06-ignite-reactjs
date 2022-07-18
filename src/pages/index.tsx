import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface Images {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string
}

interface FetchImagesResponse {
  after: string;
  data: Images[]
}

export default function Home(): JSX.Element {
  async function fetchImagesOnApi({ pageParam = null }): Promise<FetchImagesResponse> {
    const { data } = await api('/api/images', {
      params: {
        after: pageParam,
      },
    });
    return data;
  }

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', fetchImagesOnApi, {
    getNextPageParam: lastPage => lastPage?.after || null,
  });

  const formattedData = useMemo(() => {
    const formatted = data?.pages.flatMap(imageData => imageData.data.flat());
    return formatted;
  }, [data]);

  // TODO RENDER ERROR SCREEN
  //(isLoading && !isError) ? <Loading/> : (!isLoading && isError) && <Error/> algo de errado não está certo

  if (isLoading && !isError) {
    return <Loading />;
  }

  if (!isLoading && isError) {
    return <Error />;
  }

  console.log(formattedData)
  return (
    <>
      <Header />

      <Box maxW={1120} px={[10, 15, 20]} mx="auto" my={[10, 15, 20]}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}

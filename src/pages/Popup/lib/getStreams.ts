import { BigNumber } from "ethers";
import { gql, ApolloClient, InMemoryCache } from "@apollo/client";
import { GraphQlStream } from "../../shared/types";

const getStreamsDeepOut = async (address: string) => {
  const client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli",
    cache: new InMemoryCache(),
  });
  const QUERY = gql`
    query GetStreams($address: Bytes!) {
      streams(where: { sender: $address }) {
        id
        receiver {
          id
        }
        token {
          decimals
          symbol
        }
        streamedUntilUpdatedAt
        updatedAtTimestamp
      }
    }
  `;
  const result = await client.query<
    {
      streams: Array<GraphQlStream>;
    },
    { address: string }
  >({
    query: QUERY,
    variables: { address },
  });
  return (result as any).data.streams.map((stream: any) => {
    return {
      id: stream.id,
      streamedUntilUpdatedAt: BigNumber.from(stream.streamedUntilUpdatedAt),
      addressInOut: stream.receiver.id,
      updatedAtTimestamp: new Date(Number(stream.updatedAtTimestamp * 1000)),
      token: {
        decimals: Number(stream.token.decimals),
        name: stream.token.symbol,
      },
    };
  }) as GraphQlStream[];
};

export { getStreamsDeepOut };

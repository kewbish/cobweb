import React, { useEffect, useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { GraphQlStream, Stream } from "../shared/types";
import { getStreamsDeepOut } from "./lib/getStreams";
import StreamComponent from "./components/StreamComponent";
import CurrentStreamComponent from "./components/CurrentStreamComponent";
import CobwebPage from "./components/CobwebPage";

const ListStreamsOut = () => {
  const [mmAddress, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [currentStreams, , ,]: [Stream[], any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--streams", []);
  const [streams, setStreams] = useState<Array<GraphQlStream>>([]);

  useEffect(() => {
    const getStreamsRes = async () => {
      try {
        const res = await getStreamsDeepOut(mmAddress);
        if (!res) {
          // throw new Error('Expected streams');
        } else {
          setStreams(res);
        }
      } catch {
        throw new Error("Couldn't fetch streams");
      }
    };

    if (!mmAddress) {
      return;
    }

    getStreamsRes();
  }, [mmAddress]);

  return (
    <CobwebPage>
      <>
        <h2 className="mb-0">Current Streams</h2>
        <hr className="my-1" />
        <div
          className="overflow-auto"
          style={{ maxHeight: 200, marginBottom: 5 }}
        >
          {currentStreams.length ? (
            currentStreams.map((stream: Stream) => (
              <CurrentStreamComponent stream={stream} key={stream.tabId} />
            ))
          ) : (
            <p className="blue mb-1">No streams found.</p>
          )}
        </div>
        <h2 className="mb-0">Past Streams</h2>
        <hr className="my-1" />
        <div className="overflow-auto" style={{ maxHeight: 200 }}>
          {streams.length ? (
            streams.map((stream: GraphQlStream) => (
              <StreamComponent stream={stream} key={stream.id} isIn={true} />
            ))
          ) : (
            <p className="blue mb-1">No streams found.</p>
          )}
        </div>
      </>
    </CobwebPage>
  );
};

export default ListStreamsOut;

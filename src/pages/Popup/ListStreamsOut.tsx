import React, { useEffect, useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { GraphQlStream, Stream } from "../shared/types";
import { getStreamsDeepOut } from "./lib/getStreams";
import StreamComponent from "./components/StreamComponent";
import CurrentStreamComponent from "./components/CurrentStreamComponent";
import CobwebPage from "./components/CobwebPage";
import { toast } from "../shared/toast";
import ToastHandler from "./components/ToastHandler";

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
          throw new Error("Expected streams");
        } else {
          setStreams(res);
        }
      } catch {
        toast("Couldn't fetch streams");
      }
    };

    if (!mmAddress) {
      return;
    }

    getStreamsRes();
  }, [mmAddress]);

  return (
    <>
      <CobwebPage>
        <>
          <h2 className="mb-0">Current Streams</h2>
          <hr className="my-1" />
          <div
            className="overflow-auto"
            style={{ maxHeight: 200, marginBottom: 5 }}
            role="list"
          >
            {currentStreams.length ? (
              currentStreams.map((stream: Stream) => (
                <div role="listitem">
                  <CurrentStreamComponent
                    stream={stream}
                    key={stream.requestId}
                  />
                </div>
              ))
            ) : (
              <p className="blue mb-1">No streams found.</p>
            )}
          </div>
          <h2 className="mb-0">Past Streams</h2>
          <hr className="my-1" />
          <div className="overflow-auto" style={{ maxHeight: 200 }} role="list">
            {streams.length ? (
              streams.map((stream: GraphQlStream) => (
                <div role="listitem">
                  <StreamComponent
                    stream={stream}
                    key={stream.id}
                    isIn={true}
                  />
                </div>
              ))
            ) : (
              <p className="blue mb-1">No streams found.</p>
            )}
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default ListStreamsOut;

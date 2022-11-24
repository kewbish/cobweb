import React, { useEffect, useState } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
import { GraphQlStream } from "../shared/types";
import { getStreamsDeepIn } from "./lib/getStreams";
import StreamComponent from "./components/StreamComponent";
import CobwebPage from "./components/CobwebPage";
import { toast } from "../shared/toast";

const ListStreamsIn = () => {
  const [mmAddress, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [streams, setStreams] = useState<Array<GraphQlStream>>([]);

  useEffect(() => {
    const getStreamsRes = async () => {
      try {
        const res = await getStreamsDeepIn(mmAddress);
        if (!res) {
          throw new Error("Expected streams");
        } else {
          setStreams(res);
        }
      } catch {
        toast("Could not fetch streams");
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
        <h2 className="mb-0">Streams In</h2>
        <hr className="my-1" />
        <div className="overflow-auto" style={{ maxHeight: 300 }}>
          {streams.length ? (
            streams.map((stream: GraphQlStream) => (
              <StreamComponent stream={stream} key={stream.id} isIn={true} />
            ))
          ) : (
            <p className="blue">No streams found.</p>
          )}
        </div>
      </>
    </CobwebPage>
  );
};

export default ListStreamsIn;

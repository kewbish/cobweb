import React from "react";
import ToastHandler from "./components/ToastHandler";
import CobwebPage from "./components/CobwebPage";

const Help = () => {
  return (
    <>
      <CobwebPage>
        <>
          <h2 className="mb-0">Help</h2>
          <hr className="my-1" />
          <p style={{ fontSize: 16 }} className="mb-1">
            More complete help docs are available{" "}
            <a
              href="https://github.com/kewbish/cobweb/wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              here
            </a>
            .
          </p>
          <div
            className="container overflow-auto text-left"
            style={{ maxHeight: 300 }}
          >
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>What are tokens?</em> Units of money on the blockchain. The
              Ethereum blockchain that Cobweb runs on uses the ETH token.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>What are wrapped, or upgraded, tokens?</em> The Ethereum
              blockchain uses the ETH token by default, but wrapped tokens
              extend the ETH token and give it new capabilities. In Cobweb, the
              wrapped token is referred to as <span className="blue">ETHx</span>
              . It has the same monetary value as an ETH token and can be
              converted to / from an ETH token.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>What are payment streams?</em> Payment streams send tiny
              fractions of a cent to another Cobweb user while you're on their
              websites. They cost very little - default settings would only
              spend $5 in more than 5 years of average usage.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>Can Cobweb see my private key? Can it spend my tokens?</em>{" "}
              No, Cobweb cannot see any private key defaults or spend your
              tokens at any point. Cobweb only prompts you to make transactions,
              which you then confirm through Metamask.{" "}
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I get paid?</em> If you're verified in the Cobweb
              system, you'll automatically receive payments whenever someone
              goes onto a page with your Cobweb tag on it. To see your Cobweb
              tag, click your profile picture icon in the top right.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I find my Cobweb tag?</em> Click your profile picture
              in the upper right on any page. Metamask may show a popup asking
              you to sign something - please confirm the signing. Click into the
              profile page again to see your Cobweb tag.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>Why do I get Metamask popups?</em> You get Metamask popups
              when you start and stop a stream. Please confirm the transactions
              after reading them! We recommend you use default gas settings to
              ensure your stream is opened/closed as soon as possible. Look up
              tutorials on how to use Metamask if you feel uncomfortable with
              the interface.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>I didn't stop a stream. How can I close it?</em> If you didn't
              confirm the Metamask transaction to close a stream, Cobweb will
              run internal cleanup in the next 5-10 minutes to prompt you to
              close it again. Otherwise, go to{" "}
              <a
                href="app.superfluid.finance"
                target="_blank"
                className="cobweb-link"
                rel="noopener noreferrer"
              >
                app.superfluid.finance
              </a>
              , log in with Metamask, and close the stream.{" "}
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I get more wrapped tokens?</em> Click the 'Manage
              balances' button to view your current wrapped token balance, and
              click 'Upgrade more tokens' to convert some ETH to ETHx.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I convert ETHx back to ETH?</em> Click the 'Manage
              balances' button and click 'Downgrade more tokens' to convert some
              ETHx to ETH.
            </p>

            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I see my past streams?</em> Click the 'See past
              streams' button to view stream history.{" "}
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I edit stream settings?</em> Click the 'Edit stream
              settings' button to view default stream settings. For changing a
              specific user's stream settings, click 'Edit individual settings',
              and copy-paste their Cobweb tag into a new setting.{" "}
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How can I block a user?</em> Click the 'Edit stream settings'
              button, click 'Edit individual settings', and copy-paste their
              Cobweb tag into a new setting. Click 'Block'. You can also block a
              user when currently streaming to them in the home page, and report
              a user by clicking the flag on the home page if they're producing
              spammy content.
            </p>
            <p style={{ fontSize: 16 }} className="mb-1">
              <em>How do I change the wallet I use with Cobweb?</em> Open
              Metamask, and open the wallet you currently use with Cobweb. Click
              the three dots in the upper-right-hand corner, and click
              'Connected sites'. Look for 'External Chrome extension' or
              something similar, and remove it. Then open Cobweb again, which
              will prompt you to connect your desired wallet.
            </p>
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};
export default Help;

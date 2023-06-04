// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";

/**
 * @notice A contract that stores interviews
 */
contract Interview is ERC721, Ownable, FunctionsClient {
  using Counters for Counters.Counter;
  using Functions for Functions.Request;

  struct Params {
    uint started;
    uint interviewer;
    uint points;
  }

  event Started(uint indexed tokenId, Params params);
  event Updated(uint indexed tokenId, Params params);
  event ResponseReceived(bytes32 indexed requestId, bytes result, bytes err);

  string private _imageSVG;
  Counters.Counter private _counter;
  mapping(uint => Params) private _params;
  mapping(bytes32 => uint) private _requests; // key is request, value is token

  constructor(address oracle) ERC721("AI Interviewer - Interviews", "AIII") FunctionsClient(oracle) {
    _imageSVG = '<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" fill="#EEEEEE"/><path d="M45.8173 167.836H52.1893V193H45.8173V167.836ZM55.4149 175.72H61.5349V177.628C62.2789 176.812 63.1789 176.2 64.2349 175.792C65.2909 175.384 66.3949 175.18 67.5469 175.18C69.9709 175.18 71.7589 175.816 72.9109 177.088C74.0869 178.336 74.6749 180.04 74.6749 182.2V193H68.3389V183.028C68.3389 181.084 67.4509 180.112 65.6749 180.112C64.8589 180.112 64.1149 180.304 63.4429 180.688C62.7709 181.048 62.2069 181.612 61.7509 182.38V193H55.4149V175.72ZM85.2271 193.54C83.0911 193.54 81.4711 192.952 80.3671 191.776C79.2871 190.576 78.7471 188.944 78.7471 186.88V180.112H76.2991V175.72H78.7471V170.536H85.0831V175.72H89.0431V180.112H85.0831V186.016C85.0831 186.952 85.2511 187.624 85.5871 188.032C85.9471 188.44 86.5711 188.644 87.4591 188.644C88.2511 188.644 89.0431 188.428 89.8351 187.996V192.712C89.2111 193 88.5391 193.204 87.8191 193.324C87.1231 193.468 86.2591 193.54 85.2271 193.54ZM101.778 193.54C98.3939 193.54 95.7299 192.748 93.7859 191.164C91.8659 189.58 90.9059 187.336 90.9059 184.432C90.9059 181.576 91.7579 179.32 93.4619 177.664C95.1899 176.008 97.6739 175.18 100.914 175.18C102.978 175.18 104.742 175.576 106.206 176.368C107.694 177.136 108.81 178.204 109.554 179.572C110.322 180.916 110.706 182.44 110.706 184.144V186.484H96.9179C97.1579 187.444 97.7579 188.14 98.7179 188.572C99.6779 189.004 100.986 189.22 102.642 189.22C103.77 189.22 104.922 189.124 106.098 188.932C107.298 188.74 108.33 188.476 109.194 188.14V192.316C108.306 192.676 107.19 192.964 105.846 193.18C104.526 193.42 103.17 193.54 101.778 193.54ZM104.73 182.524C104.634 181.588 104.25 180.856 103.578 180.328C102.906 179.8 101.982 179.536 100.806 179.536C99.6539 179.536 98.7419 179.812 98.0699 180.364C97.3979 180.892 97.0139 181.612 96.9179 182.524H104.73ZM113.212 175.72H119.332V177.88C120.004 177.112 120.952 176.524 122.176 176.116C123.4 175.684 124.756 175.468 126.244 175.468V180.328C124.66 180.328 123.256 180.556 122.032 181.012C120.832 181.468 120.004 182.152 119.548 183.064V193H113.212V175.72ZM127.152 175.72H133.488L137.412 185.764L141.3 175.72H147.636L140.4 193H134.388L127.152 175.72ZM153.545 173.416C152.585 173.416 151.781 173.104 151.133 172.48C150.485 171.856 150.161 171.064 150.161 170.104C150.161 169.168 150.485 168.388 151.133 167.764C151.781 167.116 152.585 166.792 153.545 166.792C154.481 166.792 155.273 167.116 155.921 167.764C156.593 168.388 156.929 169.168 156.929 170.104C156.929 171.04 156.593 171.832 155.921 172.48C155.273 173.104 154.481 173.416 153.545 173.416ZM150.377 175.72H156.713V193H150.377V175.72ZM170.333 193.54C166.949 193.54 164.285 192.748 162.341 191.164C160.421 189.58 159.461 187.336 159.461 184.432C159.461 181.576 160.313 179.32 162.017 177.664C163.745 176.008 166.229 175.18 169.469 175.18C171.533 175.18 173.297 175.576 174.761 176.368C176.249 177.136 177.365 178.204 178.109 179.572C178.877 180.916 179.261 182.44 179.261 184.144V186.484H165.473C165.713 187.444 166.313 188.14 167.273 188.572C168.233 189.004 169.541 189.22 171.197 189.22C172.325 189.22 173.477 189.124 174.653 188.932C175.853 188.74 176.885 188.476 177.749 188.14V192.316C176.861 192.676 175.745 192.964 174.401 193.18C173.081 193.42 171.725 193.54 170.333 193.54ZM173.285 182.524C173.189 181.588 172.805 180.856 172.133 180.328C171.461 179.8 170.537 179.536 169.361 179.536C168.209 179.536 167.297 179.812 166.625 180.364C165.953 180.892 165.569 181.612 165.473 182.524H173.285ZM181.046 175.72H187.382L190.154 185.62L192.926 175.72H198.038L200.81 185.62L203.582 175.72H209.918L204.122 193H198.434L195.482 183.28L192.53 193H186.842L181.046 175.72Z" fill="black"/><path d="M145.819 127.566L163.558 109.822L137.134 78.7723C136.049 84.1013 133.436 89.1796 129.307 93.3098C125.177 97.44 120.099 100.049 114.771 101.134L145.817 127.566H145.819ZM165.96 112.641L148.639 129.964L151.476 132.378C153.653 134.234 156.362 135.098 159.027 134.991C161.684 134.884 164.308 133.806 166.334 131.78L167.777 130.33C169.806 128.3 170.888 125.68 170.991 123.022C171.098 120.358 170.234 117.648 168.378 115.471L165.965 112.633L165.96 112.641ZM138.029 104.635C137.309 103.92 137.306 102.753 138.021 102.033C138.737 101.313 139.903 101.31 140.623 102.026L145.077 106.48C145.797 107.196 145.8 108.362 145.085 109.082C144.369 109.802 143.203 109.805 142.483 109.09L138.029 104.635ZM128.918 57.868C126.963 66.6037 122.563 74.3911 116.475 80.4795C110.39 86.5652 102.6 90.9647 93.8662 92.9205C98.3278 96.3229 103.675 98.0324 109.011 98.0324C115.413 98.0247 121.816 95.5817 126.698 90.6989C131.58 85.8161 134.023 79.4129 134.023 73.013C134.023 67.6729 132.322 62.3285 128.92 57.8664L128.918 57.868ZM90.4919 89.8246C99.5662 88.3666 107.669 84.071 113.87 77.871C120.069 71.671 124.365 63.5662 125.822 54.495C121.065 50.1693 115.036 48.0033 109.009 48C102.617 47.9966 96.2114 50.4395 91.325 55.3258C86.4428 60.2051 84 66.6083 84 73.015C84 79.0417 86.1665 85.069 90.491 89.8255L90.4919 89.8246Z" fill="black"/></svg>';
  }

  /// ***************************
  /// ***** OWNER FUNCTIONS *****
  /// ***************************

  function setImageSVG(string memory imageSVG) public onlyOwner {
    _imageSVG = imageSVG;
  }

  /// **************************
  /// ***** USER FUNCTIONS *****
  /// **************************

  function start(uint interviewer) public {
    // Check interview
    if (isStarted(msg.sender, interviewer)) {
      revert("Interview is already started");
    }
    // Update counter
    _counter.increment();
    // Mint token
    uint256 tokenId = _counter.current();
    _mint(msg.sender, tokenId);
    // Set params
    Params memory params = Params(block.timestamp, interviewer, 0);
    _params[tokenId] = params;
    emit Started(tokenId, params);
  }

  /**
   * @notice Send a request to Chainlink functions
   *
   * @param source JavaScript source code
   * @param secrets Encrypted secrets payload
   * @param args List of arguments accessible from within the source code
   * @param subscriptionId Funtions billing subscription ID
   * @param gasLimit Maximum amount of gas used to call the client contract's `handleOracleFulfillment` function
   * @return Functions request ID
   */
  function executeRequest(
    uint tokenId,
    string calldata source,
    bytes calldata secrets,
    string[] calldata args,
    uint64 subscriptionId,
    uint32 gasLimit
  ) public returns (bytes32) {
    // Check caller
    if (msg.sender != _ownerOf(tokenId)) {
      revert("Caller is not the token owner");
    }
    // Send request
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, source);
    if (secrets.length > 0) {
      req.addRemoteSecrets(secrets);
    }
    if (args.length > 0) req.addArgs(args);
    bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
    // Save request
    _requests[assignedReqID] = tokenId;
    // Return
    return assignedReqID;
  }

  /// *********************************
  /// ***** PUBLIC VIEW FUNCTIONS *****
  /// *********************************

  function getImageSVG() public view returns (string memory) {
    return _imageSVG;
  }

  function getParams(uint tokenId) public view returns (Params memory) {
    return _params[tokenId];
  }

  function isStarted(address owner, uint interviewer) public view returns (bool) {
    uint tokenId = find(owner, interviewer);
    return _params[tokenId].started != 0;
  }

  function find(address owner, uint interviewer) public view returns (uint) {
    uint tokenId;
    for (uint i = 1; i <= _counter.current(); i++) {
      if (ownerOf(i) == owner && _params[i].interviewer == interviewer) {
        tokenId = i;
      }
    }
    return tokenId;
  }

  function tokenURI(uint tokenId) public view override returns (string memory) {
    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          Base64.encode(
            abi.encodePacked(
              '{"name":"AI Interviewer - Interview #',
              Strings.toString(tokenId),
              '","image":"data:image/svg+xml;base64,',
              Base64.encode(abi.encodePacked(_imageSVG)),
              '","attributes":[{"trait_type":"interviewer","value":"',
              Strings.toString(_params[tokenId].interviewer),
              '"},{"trait_type":"points","value":"',
              Strings.toString(_params[tokenId].points),
              '"}]}'
            )
          )
        )
      );
  }

  /// ******************************
  /// ***** INTERNAL FUNCTIONS *****
  /// ******************************

  /**
   * @notice Callback that is invoked once the Chainlink DON has resolved the request or hit an error
   *
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
    // Emit event
    emit ResponseReceived(requestId, response, err);
    // Update points
    uint points = abi.decode(response, (uint256));
    uint tokenId = _requests[requestId];
    _params[tokenId].points = points;
    emit Updated(tokenId, _params[tokenId]);
  }

  /**
   * @notice A function that is called before any token transfer
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint firstTokenId,
    uint batchSize
  ) internal virtual override(ERC721) {
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    // Disable transfers except minting
    if (from != address(0)) revert("Token is not transferable");
  }
}

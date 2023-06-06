// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @notice A contract that stores profiles
 */
contract Profile is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  event URISet(uint256 indexed tokenId, string tokenURI);

  Counters.Counter private _counter;
  mapping(address => uint256) private _owners;

  constructor() ERC721("AI Interviewer - Profiles", "AIIP") {}

  /// **************************
  /// ***** USER FUNCTIONS *****
  /// **************************

  function setURI(string memory tokenURI) public {
    // Mint token if sender does not have it yet
    if (_owners[msg.sender] == 0) {
      // Update counter
      _counter.increment();
      // Mint token
      uint256 tokenId = _counter.current();
      _mint(msg.sender, tokenId);
      _owners[msg.sender] = tokenId;
      // Set URI
      _setURI(tokenId, tokenURI);
    }
    // Set URI if sender already have token
    else {
      _setURI(_owners[msg.sender], tokenURI);
    }
  }

  /// ***********************************
  /// ***** EXTERNAL VIEW FUNCTIONS *****
  /// ***********************************

  function getTokenId(address owner) external view returns (uint) {
    return _owners[owner];
  }

  function getURI(address owner) external view returns (string memory) {
    uint256 tokenId = _owners[owner];
    if (_exists(tokenId)) {
      return tokenURI(tokenId);
    } else {
      return "";
    }
  }

  /// ******************************
  /// ***** INTERNAL FUNCTIONS *****
  /// ******************************

  function _setURI(uint256 tokenId, string memory tokenURI) private {
    _setTokenURI(tokenId, tokenURI);
    emit URISet(tokenId, tokenURI);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 firstTokenId,
    uint256 batchSize
  ) internal virtual override(ERC721) {
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    // Disable transfers except minting
    if (from != address(0)) revert("Token not transferable");
  }
}

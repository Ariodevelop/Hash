/**
 * Generate a hash value based on the given options.
 * @param {Object} [options] - An object containing options for generating the hash value.
 * @param {string} [options.input] - The input string to generate the hash value from. If empty, the current timestamp will be used as the input.
 * @param {number} [options.salt] - A numeric salt value to use in generating the hash value.
 * @param {number} [options.outputLength] - The desired length of the generated hash value.
 * @param {string} [options.outputCharacterSet] - The number of possible characters to use in the generated hash value.
 * @param {RegExp} [options.pattern] - A regular expression to match against the generated hash value.
 * @param {number} [options.proofOfWorkKey] - A numeric value used to find proof of work point.
 * @returns {Object} - An object containing the generated hash value and the proof of work used to generate it.
 */

function ArioHash(options = {}) {
  let {
    input = "",
    salt = 0,
    outputLength = 128,
    outputCharacterSet,
    pattern = /\w*/,
    proofOfWorkKey = 0,
  } = options;

  // Set default input to the current timestamp if none is provided
  input = input || `${Date.now()}`;

  // Use english character as the default character set for the hash output
  const defaultCharacterSet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?!@#$%^&*()_+=-~";

  const characterSet = outputCharacterSet || defaultCharacterSet;

  let seed = salt;
  let proofOfWork = input;
  let proofOfWorkKeyProcessor = proofOfWorkKey;

  const randomNumbers = [
    0xabbda52e, 0x5e64a72f, 0x4ccf59d6, 0x4f4ff1f2, 0x2697845e, 0xe66280ad,
    0x9764a314, 0x578ab16a, 0xba83c6eb, 0xc751b390, 0xda0093ea, 0xde7f5c4d,
    0xb7245271, 0x3dae31f9, 0xf16ef967, 0x3964c0b2, 0x4e3fb2e8, 0x422b1f49,
    0x947c39c6, 0x0e25c077, 0xdfb27618, 0x4509400d, 0x0c0fa705, 0x19dff716,
    0x20e34b15, 0x8b545cde, 0x444d973b, 0x561605cd, 0x94046e71, 0xccd6c1ac,
    0x0f628daa, 0x58b3a5c5, 0x5c7383d4, 0x640ed7bd, 0x1eefbc49, 0xc1326faf,
    0xaf9b2b8a, 0x08c2525e, 0xf2cf938b, 0x3743f10b, 0xd88e0465, 0x1fa7a05d,
    0xcc20f921, 0xc74f2d34, 0x41646d12, 0xbd1b7c78, 0xd498268c, 0x4c72d6fe,
    0xdaf6a821, 0x4b5aa11b, 0x675c37bb, 0xc1388f26, 0x4f3d8c6f, 0x25226e3c,
    0x7414a0e8, 0x5e2d2506, 0x9122a2b0, 0x344aa0a7, 0xcc25963b, 0x11510d9e,
    0xc106109e, 0xfa6f9fe8, 0xc3d5d44a, 0xe0d8ea93, 0x96e68ac2, 0x36032037,
    0x3de80460, 0x465d681c, 0x37af2df3, 0x32a59e18, 0x2087661a, 0x722917b6,
    0xf0c6cffb, 0x6cbb6d4b, 0x368f6635, 0x31d7ed77, 0x66506291, 0xb5cac329,
    0xfcfaab68, 0xd57233a7, 0xb709ddc5, 0x4095eb63, 0x87eeba95, 0xdcc3eee5,
    0xee13e0f4, 0xe13a0816, 0x38f16457, 0x79ddef92, 0xfaba9e4e, 0x4aa22027,
    0x530c8c7f, 0xd7bdf5a6, 0xc4aed678, 0xa1e6a475, 0xd1bfe411, 0x7cb60932,
    0x8aedc07f, 0xe6736bde, 0xce5fb70a, 0xca35e0c3, 0x5fb54e7b, 0xb4db7b83,
    0x846ef988, 0x43d3b047, 0x074ed877, 0xace79571, 0x48760bc1, 0x0c83f7d5,
    0xc9fb4d50, 0x87bb8ca8, 0xbd0e5fbf, 0x6eca5c79, 0x87e86561, 0x2cbf924e,
    0xf040b977, 0x929392b9, 0x01e91078, 0x640650db, 0x0da6595f, 0x4db37c23,
    0x424f032b, 0x77132774, 0xcd677662, 0x7746dff3, 0xa889a8ca, 0xe95e62f2,
    0xab646d41, 0xe47b2bb3,
  ];

  // message pending
  while (input.length < outputLength) {
    input += String.fromCharCode(
      randomNumbers[input.length % randomNumbers.length] % 0xffff,
    );
  }


  let output;
  let proofOfWorkKeyOutput;

  do {
    output = "";
    proofOfWorkKeyOutput = proofOfWorkKeyProcessor;

    for (const character of proofOfWork) {
      seed += character.charCodeAt(0);
      seed %= 0xffffffff;
    }

    for (let i = 0; i < randomNumbers.length; i++) {
      randomNumbers[i] += input.charCodeAt(i % input.length) + seed;
      randomNumbers[i] %= 0xffffffff;
    }

    for (let i = 0; i < outputLength; i++) {
      let code = i * characterSet.charCodeAt(i % characterSet.length);

      code += proofOfWork.charCodeAt(code % proofOfWork.length) * i;
      code += randomNumbers[i % randomNumbers.length] * i;
      code += randomNumbers[outputLength % randomNumbers.length];
      code += proofOfWork.charCodeAt(code % proofOfWork.length);
      code += seed;

      output += characterSet[code % characterSet.length];
    }

    proofOfWork = `${input}${proofOfWorkKeyProcessor.toString(36)}`;
    proofOfWorkKeyProcessor++;

  } while (!output.match(pattern));

  return {
    hash: output,
    proofOfWorkIndex: proofOfWorkKeyOutput,
  };
}

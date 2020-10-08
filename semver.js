const test = /(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:[.+~-](?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const prerelease = /(?<type>[a-zA-Z]+)(?:[+~.-]?)(?<version>.*)/;
const groups = ['major', 'minor', 'patch'];
const preReleases = ['alpha', 'beta', 'rc', ''];

/**
 * Test semver package versions.
 *
 * If v1 is higher version than v2, a positive integer will be returned.
 * If v2 is higher version than v1, a negative integer will be returned.
 * If v1 and v2 are equal, a 0 integer will be returned.
 *
 * Pre-releases are diffed as following:
 *
 * alpha is less than beta.
 * beta is less than rc.
 * rc is less than empty value.
 *
 * Pre-release versions (that is, <type>-x.x.x) can be separated by the following characters:
 *
 * -, ~, +, . and empty value.
 *
 * Pre-release versions are parsed as following:
 *
 * Integers are value matches (1 is larger than 2, etc).
 * Strings is matched with standard string check (basically 'a' < 'b').
 * If all matches but one string is longer, it will be seen as a higher version.
 * If all matches, the package is equal in version.
 *
 * @param {string} v1
 * @param {string} v2
 * @return {number}
 */
const diff = (v1, v2) => {
  const group1 = v1.match(test).groups;
  const group2 = v2.match(test).groups;

  for (const type of groups) {
    const val = parseInt(group1[type], 10) - parseInt(group2[type], 10);

    // If value is not equal, one of the packages are higher version.
    if (val !== 0) {
      return val;
    }
  }

  return diffPreRelease(group1, group2);
};

/**
 *
 * @param {Object|{prerelease: string}} group1
 * @param {Object|{prerelease: string}} group2
 * @return {number}
 */
const diffPreRelease = (group1, group2) => {
  // If one of the packages are _not_ a pre-release, it's higher version.
  if (group1.prerelease === undefined) {
    return 1;
  } else if (group2.prerelease === undefined) {
    return -1;
  }

  const pre1 = group1.prerelease.match(prerelease).groups;
  const pre2 = group2.prerelease.match(prerelease).groups;

  // If there is a diff in pre-release type (that is, alpha vs beta), check which is latest type.
  const typeDiff = preReleases.indexOf(pre1.type.toLowerCase()) - preReleases.indexOf(pre2.type.toLowerCase());
  if (typeDiff !== 0) {
    return typeDiff;
  }

  // Check each version entry of the pre-release. Could basically be arbitrary characters, we skip all `.-~+`.
  const preV1 = pre1.version.replace(/[-.~+]/, '');
  const preV2 = pre2.version.replace(/[-.~+]/, '');
  let index = Math.min(preV1.length, preV2.length);
  for (let i = 0; i < index; i++) {
    // If a version is higher, return diff.
    if (pre1.version[i] !== pre2.version[i]) {
      return pre1.version[i] - pre2.version[i];
    }
  }

  // At this point, most of the values matches, but one pre-release version might be a longer string.
  // So if one is longer than the other, return that as higher value, else they match.
  return pre1.version.length > pre2.version.length ? 1 : pre1.version.length < pre2.version.length ? -1 : 0;
}

module.exports = {
  diff
};

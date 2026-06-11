export class StagingProviderInterface {
  constructor({ profile }) {
    if (!profile) {
      throw new Error('provider profile is required');
    }
    this.profile = profile;
  }

  checkCapabilities() {
    throw new Error('checkCapabilities must be implemented by provider adapters');
  }

  planApply() {
    throw new Error('planApply must be implemented by provider adapters');
  }
}

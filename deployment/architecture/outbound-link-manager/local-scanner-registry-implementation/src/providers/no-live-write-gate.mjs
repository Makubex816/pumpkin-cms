import { localDryRunModes } from './provider-profile-model.mjs';

export function evaluateNoLiveWriteGate({ profile, operation = 'apply-plan-dry-run' }) {
  if (!profile) {
    return blocked('PROVIDER_PROFILE_MISSING', 'provider profile is required');
  }
  if (operation === 'provider-check') {
    return allowed('provider profile can be checked locally');
  }
  if (operation === 'staging-execute') {
    if (profile.providerMode === 'staging-simulated' && profile.approvals?.stagingWriteApproved === true && profile.capabilities?.canExecuteStagingWrites === true) {
      return allowed('staging-simulated can write only to ignored .tmp provider stores');
    }
    if (profile.providerMode === 'staging-simulated') {
      return blocked('STAGING_SIMULATED_APPROVAL_REQUIRED', 'staging-simulated execution requires an explicit local staging approval reference');
    }
    if (profile.providerMode === 'live-readonly') {
      return blocked('LIVE_READONLY_WRITE_EXECUTION_BLOCKED', 'live-readonly can verify reads only and cannot execute staging writes');
    }
    if (profile.providerMode === 'live-write-approved') {
      return blocked('LIVE_WRITE_APPROVED_UNAVAILABLE', 'live-write-approved remains blocked until a future explicit live-write approval');
    }
    if (profile.providerMode === 'production-runtime') {
      return blocked('PRODUCTION_RUNTIME_BLOCKED', 'production-runtime cannot be selected from this local staging scaffold');
    }
    return blocked('STAGING_EXECUTION_PROFILE_REQUIRED', `provider mode ${profile.providerMode} is not allowed for staging execution`);
  }
  if (localDryRunModes.includes(profile.providerMode)) {
    return allowed(`${profile.providerMode} can generate local dry-run output only`);
  }
  if (profile.providerMode === 'live-readonly') {
    return blocked('LIVE_READONLY_WRITE_PLAN_BLOCKED', 'live-readonly can verify reads only and cannot produce write apply plans in this phase');
  }
  if (profile.providerMode === 'live-write-approved') {
    return blocked('LIVE_WRITE_APPROVED_UNAVAILABLE', 'live-write-approved remains blocked until a future explicit live-write approval');
  }
  if (profile.providerMode === 'production-runtime') {
    return blocked('PRODUCTION_RUNTIME_BLOCKED', 'production-runtime cannot be selected from this local staging scaffold');
  }
  return blocked('PROVIDER_MODE_NOT_ALLOWED', `provider mode is not allowed for ${operation}`);
}

function allowed(message) {
  return {
    status: 'allowed',
    allowed: true,
    code: 'OK',
    message,
    liveWriteAllowed: false,
    productionWriteAllowed: false
  };
}

function blocked(code, message) {
  return {
    status: 'blocked',
    allowed: false,
    code,
    message,
    liveWriteAllowed: false,
    productionWriteAllowed: false
  };
}

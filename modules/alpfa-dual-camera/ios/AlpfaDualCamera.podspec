Pod::Spec.new do |s|
  s.name           = 'AlpfaDualCamera'
  s.version        = '1.0.0'
  s.summary        = 'ALPFA NJIT simultaneous front and rear iPhone camera'
  s.description    = 'An Expo native module backed by AVCaptureMultiCamSession.'
  s.author         = 'ALPFA NJIT'
  s.homepage       = 'https://github.com/AnabhayanA/alpfa-njit-app'
  s.platform       = :ios, '16.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end

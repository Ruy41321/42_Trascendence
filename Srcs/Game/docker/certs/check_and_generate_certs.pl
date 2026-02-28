#!/usr/bin/env perl
use strict;
use warnings;
use File::Spec;
use File::Basename qw(dirname);
use Cwd qw(abs_path);

# directory dello script (docker/certs)
my $script_path = abs_path($0);
my $script_dir  = dirname($script_path);

my $crt = File::Spec->catfile($script_dir, 'server.crt');
my $key = File::Spec->catfile($script_dir, 'server.key');

sub file_exists { -f $_[0] }

if (file_exists($crt) && file_exists($key)) {
    print "SSL certificates found.\n";
    exit 0;
}

print "SSL certificates not found. Generating...\n";

sub run_cmd {
    my ($cmd) = @_;
    print "Running: $cmd\n";
    system($cmd);
    my $ec = $? >> 8;
    print "Exit code: $ec\n";
    return $ec;
}

# Prova bash (controlla se 'bash' è invocabile)
my $bash_ok = 0;
if (`bash -c "echo BASH_OK" 2>/dev/null` =~ /BASH_OK/) {
    $bash_ok = 1;
}

if ($bash_ok) {
    my $cmd = qq{bash -lc "chmod +x '$script_dir/generate-certs.sh' 2>/dev/null || true; '$script_dir/generate-certs.sh'"};
    my $ec = run_cmd($cmd);
    exit $ec if $ec != 0;
    exit 0 if file_exists($crt) && file_exists($key);
}

# Prova PowerShell script
my $ps1 = File::Spec->catfile($script_dir, 'generate-certs.ps1');
if (-f $ps1) {
    my $cmd = qq{powershell -NoProfile -ExecutionPolicy Bypass -File "$ps1"};
    my $ec = run_cmd($cmd);
    exit $ec if $ec != 0;
    exit 0 if file_exists($crt) && file_exists($key);
}

# Prova batch
my $bat = File::Spec->catfile($script_dir, 'generate-certs.bat');
if (-f $bat) {
    my $cmd = qq{cmd /c "$bat"};
    my $ec = run_cmd($cmd);
    exit $ec if $ec != 0;
    exit 0 if file_exists($crt) && file_exists($key);
}

print "No generator script found in docker/certs (bash/ps1/bat) or generation failed.\n";
exit 1;

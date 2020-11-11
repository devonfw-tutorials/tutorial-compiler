#!/bin/sh

echo "Setup of step <%= stepCount; %>..."
while [ ! -f /root/scripts/step<%= stepCount; %>/FINISHED ]
do
	sleep 1s
done

echo "Done. You can continue by following the constructions on the left."

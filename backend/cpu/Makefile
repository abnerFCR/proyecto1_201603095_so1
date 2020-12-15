obj-m += cpu_201603095.o

KERNELDIR ?= /lib/modules/$(shell uname -r)/build

initmodules:
	make -C $(KERNELDIR) M=$(PWD) modules

cleanmodules:
	make -C $(KERNELDIR) M=$(PWD) clean